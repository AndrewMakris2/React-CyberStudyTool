import { Layers, Trash2, Play, Edit2 } from 'lucide-react'
import type { Deck } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface DeckListProps {
  decks: Deck[]
  deckCardCounts: Record<number, number>
  deckDueCounts: Record<number, number>
  onStudy: (deck: Deck) => void
  onDelete: (deckId: number) => void
  onEdit: (deck: Deck) => void
}

export default function DeckList({ decks, deckCardCounts, deckDueCounts, onStudy, onDelete, onEdit }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Layers size={48} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">No decks yet</p>
        <p className="text-sm mt-1">Generate flashcards from your notes to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map(deck => {
        const total = deckCardCounts[deck.id!] ?? 0
        const due = deckDueCounts[deck.id!] ?? 0
        return (
          <Card key={deck.id} variant="elevated" className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                  <Layers size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{deck.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{total} cards</p>
                </div>
              </div>
              {due > 0 && (
                <Badge variant="warning" size="sm">{due} due</Badge>
              )}
            </div>

            {deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {deck.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} size="sm">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => onStudy(deck)}
                disabled={total === 0}
              >
                <Play size={12} /> Study
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(deck)}>
                <Edit2 size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(deck.id!)}
                className="hover:text-red-400">
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}