import { Layers, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

interface FlashcardDueWidgetProps {
  dueCount: number
  totalCount: number
  streak: number
}

export default function FlashcardDueWidget({ dueCount, totalCount, streak }: FlashcardDueWidgetProps) {
  const navigate = useNavigate()

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Flashcard Review
        </CardTitle>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-400">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold">{streak} day streak</span>
          </div>
        )}
      </CardHeader>

      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-white">{dueCount}</span>
          <span className="text-gray-400 text-sm mb-1">cards due today</span>
        </div>

        {totalCount > 0 && (
          <Progress
            value={totalCount - dueCount}
            max={totalCount}
            label={`${totalCount - dueCount} of ${totalCount} reviewed`}
            showPercent
            color="cyan"
            size="sm"
          />
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/flashcards')}
          disabled={dueCount === 0}
          leftIcon={<Play size={14} />}
        >
          {dueCount > 0 ? `Review ${dueCount} Cards` : 'All Caught Up!'}
        </Button>
      </div>
    </Card>
  )
}