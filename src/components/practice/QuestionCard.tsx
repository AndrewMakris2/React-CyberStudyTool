import { useState } from 'react'
import { Flag, FlagOff, ChevronRight } from 'lucide-react'
import type { PracticeQuestion } from '../../types'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import AnswerExplanation from './AnswerExplanation'

interface QuestionCardProps {
  question: PracticeQuestion
  index: number
  total: number
  flagged?: boolean
  onToggleFlag?: () => void
  onNext?: () => void
  examMode?: boolean
  selectedAnswers?: string[]
  onAnswerSelect?: (optionIds: string[]) => void
  showResult?: boolean
}

export default function QuestionCard({
  question, index, total, flagged, onToggleFlag,
  onNext, examMode, selectedAnswers = [], onAnswerSelect, showResult
}: QuestionCardProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedAnswers)
  const [submitted, setSubmitted] = useState(false)

  const isMultiResponse = question.type === 'multiple-response'
  const selected = examMode ? selectedAnswers : localSelected
  const isCorrect = submitted && question.correctAnswers.every(a => selected.includes(a)) && selected.every(a => question.correctAnswers.includes(a))

  const handleSelect = (optionId: string) => {
    if (submitted && !examMode) return
    if (isMultiResponse) {
      const next = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId]
      examMode ? onAnswerSelect?.(next) : setLocalSelected(next)
    } else {
      const next = [optionId]
      examMode ? onAnswerSelect?.(next) : setLocalSelected(next)
    }
  }

  const handleSubmit = () => setSubmitted(true)

  const getOptionStyle = (optionId: string) => {
    const isSelected = selected.includes(optionId)
    const isCorrectOption = question.correctAnswers.includes(optionId)
    if ((submitted && !examMode) || showResult) {
      if (isCorrectOption) return 'border-green-600 bg-green-900/30 text-green-300'
      if (isSelected && !isCorrectOption) return 'border-red-600 bg-red-900/30 text-red-300'
    }
    if (isSelected) return 'border-cyan-600 bg-cyan-900/20 text-white'
    return 'border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white'
  }

  const difficultyColor = { easy: 'success', medium: 'warning', hard: 'danger' } as const

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400">Question {index + 1} of {total}</span>
          <Badge variant={difficultyColor[question.difficulty]}>{question.difficulty}</Badge>
          <Badge variant="default">{question.type.replace(/-/g, ' ')}</Badge>
        </div>
        {onToggleFlag && (
          <button onClick={onToggleFlag} className={cn('transition-colors', flagged ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400')}>
            {flagged ? <Flag size={18} /> : <FlagOff size={18} />}
          </button>
        )}
      </div>

      {/* Stem */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{question.stem}</p>
        {isMultiResponse && (
          <p className="text-xs text-cyan-400 mt-3 font-medium">Select all that apply</p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all',
              getOptionStyle(option.id)
            )}
          >
            <span className={cn(
              'w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
              selected.includes(option.id) ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-500 text-gray-400'
            )}>
              {option.id}
            </span>
            <span className="flex-1">{option.text}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      {!examMode && (
        <div className="flex gap-3">
          {!submitted ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={selected.length === 0}
              className="flex-1"
            >
              Check Answer
            </Button>
          ) : (
            <Button variant="primary" onClick={onNext} rightIcon={<ChevronRight size={14} />} className="flex-1">
              Next Question
            </Button>
          )}
        </div>
      )}

      {/* Explanation */}
      {(submitted && !examMode) || showResult ? (
        <AnswerExplanation
          question={question}
          selectedAnswers={selected}
          isCorrect={isCorrect}
        />
      ) : null}
    </div>
  )
}