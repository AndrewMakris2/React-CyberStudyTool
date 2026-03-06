import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import {
  getDecks, createDeck, deleteDeck, getFlashcardsByDeck,
  getDueFlashcards, updateFlashcard, addFlashcards, getDueCount,
} from '../db'
import { calculateNextReview, sortDueCards } from '../utils/spacedRepetition'
import type { Deck, Flashcard, FlashcardRating, CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import DeckList from '../components/flashcards/DeckList'
import FlashcardViewer from '../components/flashcards/FlashcardViewer'
import FlashcardEditor from '../components/flashcards/FlashcardEditor'

type Mode = 'decks' | 'studying' | 'editor'

export default function FlashcardsPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast = useAppStore(s => s.showToast)

  const [decks, setDecks] = useState<Deck[]>([])
  const [deckCardCounts, setDeckCardCounts] = useState<Record<number, number>>({})
  const [deckDueCounts, setDeckDueCounts] = useState<Record<number, number>>({})
  const [mode, setMode] = useState<Mode>('decks')
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null)
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)

  const loadDecks = useCallback(async () => {
    const d = await getDecks(activeCertId)
    setDecks(d)
    const counts: Record<number, number> = {}
    const dueCounts: Record<number, number> = {}
    for (const deck of d) {
      if (deck.id) {
        const cards = await getFlashcardsByDeck(deck.id)
        counts[deck.id] = cards.length
        const now = new Date()
        dueCounts[deck.id] = cards.filter(c => new Date(c.dueDate) <= now).length
      }
    }
    setDeckCardCounts(counts)
    setDeckDueCounts(dueCounts)
  }, [activeCertId])

  useEffect(() => { loadDecks() }, [loadDecks])

  const handleStudyDeck = async (deck: Deck) => {
    if (!deck.id) return
    const cards = await getFlashcardsByDeck(deck.id)
    const sorted = sortDueCards(cards)
    if (sorted.length === 0) { showToast('No cards in this deck yet!', 'info'); return }
    setStudyCards(sorted)
    setCardIndex(0)
    setActiveDeck(deck)
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 })
    setMode('studying')
  }

  const handleRate = async (rating: FlashcardRating) => {
    const card = studyCards[cardIndex]
    if (!card?.id) return

    const next = calculateNextReview(card, rating)
    await updateFlashcard(card.id, {
      interval: next.interval,
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      dueDate: next.dueDate,
      lastReviewed: new Date(),
    })

    setSessionStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }))

    if (cardIndex < studyCards.length - 1) {
      setCardIndex(i => i + 1)
    } else {
      showToast(`Session complete! ${sessionStats.good + sessionStats.easy + 1} cards reviewed.`, 'success')
      setMode('decks')
      await loadDecks()
    }
  }

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) return
    await createDeck({
      name: newDeckName.trim(),
      certId: activeCertId as CertId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setNewDeckName('')
    setShowNewDeck(false)
    showToast('Deck created!', 'success')
    await loadDecks()
  }

  const handleDeleteDeck = async (id: number) => {
    await deleteDeck(id)
    showToast('Deck deleted', 'info')
    await loadDecks()
  }

  const handleSaveCards = async (cards: Omit<Flashcard, 'id'>[]) => {
    if (!editingDeck?.id) return
    const withDeck = cards.map(c => ({ ...c, deckId: editingDeck.id! }))
    await addFlashcards(withDeck)
    showToast(`${cards.length} cards saved!`, 'success')
    setMode('decks')
    setEditingDeck(null)
    await loadDecks()
  }

  if (mode === 'studying' && activeDeck) {
    const card = studyCards[cardIndex]
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">{activeDeck.name}</h1>
            <p className="text-sm text-gray-400">
              {sessionStats.good + sessionStats.easy} good · {sessionStats.again} again
            </p>
          </div>
          <Button variant="ghost" onClick={() => { setMode('decks'); loadDecks() }}>
            End Session
          </Button>
        </div>
        {card && (
          <FlashcardViewer
            card={card}
            index={cardIndex}
            total={studyCards.length}
            onRate={handleRate}
            onPrev={cardIndex > 0 ? () => setCardIndex(i => i - 1) : undefined}
            onNext={cardIndex < studyCards.length - 1 ? () => setCardIndex(i => i + 1) : undefined}
          />
        )}
      </div>
    )
  }

  if (mode === 'editor' && editingDeck) {
    return (
      <div className="max-w-3xl mx-auto">
        <FlashcardEditor
          deckId={editingDeck.id!}
          certId={activeCertId as CertId}
          onSave={handleSaveCards}
          onCancel={() => { setMode('decks'); setEditingDeck(null) }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-gray-400 text-sm mt-1">
            Spaced repetition study decks for {activeCertId.replace(/-/g, ' ')}.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowNewDeck(true)} leftIcon={<Plus size={14} />}>
          New Deck
        </Button>
      </div>

      <DeckList
        decks={decks}
        deckCardCounts={deckCardCounts}
        deckDueCounts={deckDueCounts}
        onStudy={handleStudyDeck}
        onDelete={handleDeleteDeck}
        onEdit={deck => { setEditingDeck(deck); setMode('editor') }}
      />

      <Modal open={showNewDeck} onClose={() => setShowNewDeck(false)} title="New Deck" size="sm">
        <div className="p-6 flex flex-col gap-4">
          <Input
            label="Deck Name"
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateDeck() }}
            placeholder="e.g. Domain 2 - Threats & Vulnerabilities"
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowNewDeck(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleCreateDeck} disabled={!newDeckName.trim()} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}