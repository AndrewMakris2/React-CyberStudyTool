import { CheckCircle, XCircle } from 'lucide-react'
import type { PracticeQuestion } from '../../types'
import { Badge } from '../ui/Badge'

interface AnswerExplanationProps {
  question: PracticeQuestion
  selectedAnswers: string[]
  isCorrect: boolean
}

export default function AnswerExplanation({ question, isCorrect }: AnswerExplanationProps) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Result banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        isCorrect ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'
      }`}>
        {isCorrect
          ? <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          : <XCircle size={20} className="text-red-400 flex-shrink-0" />
        }
        <span className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
        {!isCorrect && (
          <span className="text-sm opacity-80">
            Correct: {question.correctAnswers.join(', ')}
          </span>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <p className="text-sm font-semibold text-white mb-2">Explanation</p>
        <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
      </div>

      {/* Wrong answer explanations */}
      {Object.keys(question.wrongAnswerExplanations).length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-3">Why other options are wrong</p>
          <div className="flex flex-col gap-2">
            {Object.entries(question.wrongAnswerExplanations).map(([optId, explanation]) => (
              <div key={optId} className="flex gap-3 text-sm">
                <Badge variant="danger" size="sm" className="flex-shrink-0 mt-0.5">{optId}</Badge>
                <span className="text-gray-400">{explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objective tags */}
      {question.objectiveIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Objectives:</span>
          {question.objectiveIds.map(id => (
            <Badge key={id} variant="info" size="sm">{id}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}