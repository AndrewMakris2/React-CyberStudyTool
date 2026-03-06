import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import type { Flashcard, CertId } from '../../types'
import { Button } from '../ui/Button'
import { TextArea } from '../ui/TextArea'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { createCardDefaults } from '../../utils/spacedRepetition'

interface FlashcardEditorProps {
  deckId: number
  certId: CertId
  initialCards?: Partial<Flashcard>[]
  onSave: (cards: Omit<Flashcard, 'id'>[]) => void
  onCancel: () => void
}

export default function FlashcardEditor({ deckId, certId, initialCards = [], onSave, onCancel }: FlashcardEditorProps) {
  const [cards, setCards] = useState<Partial<Flashcard>[]>(
    initialCards.length > 0 ? initialCards : [{ front: '', back: '', type: 'basic', tags: [] }]
  )
  const [tagInput, setTagInput] = useState<string[]>(cards.map(() => ''))

  const addCard = () => {
    setCards(prev => [...prev, { front: '', back: '', type: 'basic', tags: [] }])
    setTagInput(prev => [...prev, ''])
  }

  const removeCard = (i: number) => {
    setCards(prev => prev.filter((_, idx) => idx !== i))
    setTagInput(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateCard = (i: number, field: keyof Flashcard, value: any) => {
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  const addTag = (i: number) => {
    const tag = tagInput[i].trim()
    if (!tag) return
    const current = cards[i].tags ?? []
    if (!current.includes(tag)) {
      updateCard(i, 'tags', [...current, tag])
    }
    setTagInput(prev => prev.map((t, idx) => idx === i ? '' : t))
  }

  const removeTag = (cardIdx: number, tag: string) => {
    updateCard(cardIdx, 'tags', (cards[cardIdx].tags ?? []).filter(t => t !== tag))
  }

  const handleSave = () => {
    const valid = cards.filter(c => c.front?.trim() && c.back?.trim())
    if (!valid.length) return
    const defaults = createCardDefaults()
    const result: Omit<Flashcard, 'id'>[] = valid.map(c => ({
      deckId,
      certId,
      front: c.front!,
      back: c.back!,
      type: c.type ?? 'basic',
      tags: c.tags ?? [],
      ...defaults,
    }))
    onSave(result)
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Edit Cards ({cards.length})</h3>
        <Button variant="ghost" size="sm" onClick={addCard} leftIcon={<Plus size={14} />}>
          Add Card
        </Button>
      </div>

      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {cards.map((card, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Card {i + 1}</span>
              {cards.length > 1 && (
                <button onClick={() => removeCard(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <TextArea
              label="Front (Question)"
              value={card.front ?? ''}
              onChange={e => updateCard(i, 'front', e.target.value)}
              placeholder="Enter question or term..."
              className="min-h-[80px]"
            />
            <TextArea
              label="Back (Answer)"
              value={card.back ?? ''}
              onChange={e => updateCard(i, 'back', e.target.value)}
              placeholder="Enter answer or definition..."
              className="min-h-[80px]"
            />
            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Tags</label>
              <div className="flex flex-wrap gap-1 mb-1">
                {(card.tags ?? []).map(tag => (
                  <Badge key={tag} size="sm" className="cursor-pointer" onClick={() => removeTag(i, tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput[i] ?? ''}
                  onChange={e => setTagInput(prev => prev.map((t, idx) => idx === i ? e.target.value : t))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(i) } }}
                  placeholder="Add tag..."
                  className="text-xs"
                />
                <Button variant="outline" size="sm" onClick={() => addTag(i)}>Add</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-700">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={handleSave} leftIcon={<Save size={14} />} className="flex-1">
          Save {cards.filter(c => c.front?.trim() && c.back?.trim()).length} Cards
        </Button>
      </div>
    </div>
  )
}