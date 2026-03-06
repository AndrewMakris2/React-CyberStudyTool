import { Flag, FlagOff } from 'lucide-react'
import type { PracticeQuestion } from '../../types'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

interface ExamQuestionProps {
  question: PracticeQuestion
  index: number
  total: number
  flagged: boolean
  onToggleFlag: () => void
  selectedAnswers: string[]
  onAnswerSelect: (ids: string[]) => void
}

export default function ExamQuestion({
  question, index, total, flagged, onToggleFlag,
  selectedAnswers, onAnswerSelect,
}: ExamQuestionProps) {
  const isMulti = question.type === 'multiple-response'

  const handleSelect = (id: string) => {
    if (isMulti) {
      onAnswerSelect(
        selectedAnswers.includes(id)
          ? selectedAnswers.filter(a => a !== id)
          : [...selectedAnswers, id]
      )
    } else {
      onAnswerSelect([id])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Question {index + 1} of {total}</span>
          <Badge variant="default">{question.type.replace(/-/g, ' ')}</Badge>
          <Badge variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'}>
            {question.difficulty}
          </Badge>
        </div>
        <button
          onClick={onToggleFlag}
          className={cn('transition-colors', flagged ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400')}
          title={flagged ? 'Remove flag' : 'Flag for review'}
        >
          {flagged ? <Flag size={18} /> : <FlagOff size={18} />}
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{question.stem}</p>
        {isMulti && <p className="text-xs text-cyan-400 mt-3 font-medium">Select all that apply</p>}
      </div>

      <div className="flex flex-col gap-2">
        {question.options.map(option => {
          const isSelected = selectedAnswers.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all',
                isSelected
                  ? 'border-cyan-600 bg-cyan-900/20 text-white'
                  : 'border-gray-600 hover:border-gray-400 text-gray-300'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                isSelected ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-500 text-gray-400'
              )}>
                {option.id}
              </span>
              <span>{option.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}