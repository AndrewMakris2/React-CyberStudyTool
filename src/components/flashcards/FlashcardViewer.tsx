import { useState } from 'react'
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Flashcard, FlashcardRating } from '../../types'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

interface FlashcardViewerProps {
  card: Flashcard
  index: number
  total: number
  onRate: (rating: FlashcardRating) => void
  onPrev?: () => void
  onNext?: () => void
}

const RATINGS: { value: FlashcardRating; label: string; color: string; description: string }[] = [
  { value: 'again', label: 'Again',  color: 'bg-red-600 hover:bg-red-500',    description: '<1m' },
  { value: 'hard',  label: 'Hard',   color: 'bg-orange-600 hover:bg-orange-500', description: '~1d' },
  { value: 'good',  label: 'Good',   color: 'bg-blue-600 hover:bg-blue-500',   description: '~3d' },
  { value: 'easy',  label: 'Easy',   color: 'bg-green-600 hover:bg-green-500', description: '~7d' },
]

export default function FlashcardViewer({ card, index, total, onRate, onPrev, onNext }: FlashcardViewerProps) {
  const [flipped, setFlipped] = useState(false)

  const handleRate = (rating: FlashcardRating) => {
    setFlipped(false)
    setTimeout(() => onRate(rating), 150)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between w-full text-sm text-gray-400">
        <span>Card {index + 1} of {total}</span>
        <div className="flex gap-2">
          {card.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Badge variant="info" size="sm" className="mb-4">Question</Badge>
            <p className="text-xl font-medium text-white leading-relaxed">{card.front}</p>
            <p className="text-sm text-gray-500 mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gray-800 border border-cyan-700/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <Badge variant="success" size="sm" className="mb-4">Answer</Badge>
            <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <RotateCcw size={14} />
        <span>{flipped ? 'Click to flip back' : 'Click card to reveal'}</span>
      </div>

      {/* Rating buttons — only show when flipped */}
      <div className={cn(
        'flex gap-3 w-full transition-all duration-300',
        flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}>
        {RATINGS.map(r => (
          <button
            key={r.value}
            onClick={() => handleRate(r.value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-white font-medium text-sm transition-all',
              r.color
            )}
          >
            <span>{r.label}</span>
            <span className="text-xs opacity-75">{r.description}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onPrev} disabled={!onPrev}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <Button variant="ghost" size="sm" onClick={onNext} disabled={!onNext}>
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}