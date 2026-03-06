import { CheckCircle, XCircle, TrendingUp, BookOpen, RotateCcw } from 'lucide-react'
import type { LabFeedback as LabFeedbackType } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'
import { Button } from '../ui/Button'

interface LabFeedbackProps {
  feedback: LabFeedbackType
  labTitle: string
  onRetry: () => void
  onDone: () => void
}

export default function LabFeedback({ feedback, labTitle, onRetry, onDone }: LabFeedbackProps) {
  const pct = Math.round((feedback.overallScore / feedback.maxScore) * 100)
  const passed = pct >= 70

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Overall score */}
      <Card variant="elevated" className="text-center py-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 text-2xl font-bold mb-4 ${
          passed
            ? 'border-green-500 text-green-400 bg-green-900/30'
            : 'border-red-500 text-red-400 bg-red-900/30'
        }`}>
          {pct}%
        </div>
        <h2 className="text-xl font-bold text-white mb-1">
          {passed ? '✅ Well Done!' : '📚 Keep Practicing'}
        </h2>
        <p className="text-gray-400 text-sm">
          {feedback.overallScore} / {feedback.maxScore} points — {labTitle}
        </p>
      </Card>

      {/* Criteria results */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Criteria Breakdown</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {feedback.criteriaResults.map(c => {
            const critPct = Math.round((c.earned / c.max) * 100)
            return (
              <div key={c.criterionId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-200">{c.label}</span>
                  <span className={`text-sm font-bold ${critPct >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.earned}/{c.max}
                  </span>
                </div>
                <Progress
                  value={critPct}
                  color={critPct >= 70 ? 'green' : critPct >= 50 ? 'yellow' : 'red'}
                  size="sm"
                />
                <p className="text-xs text-gray-400 mt-1">{c.feedback}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <ul className="flex flex-col gap-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle size={16} className="text-red-400" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <ul className="flex flex-col gap-2">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-1 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Next actions */}
      {feedback.actionableNext.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <ul className="flex flex-col gap-2">
            {feedback.actionableNext.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <Badge variant="info" size="sm" className="flex-shrink-0 mt-0.5">{i + 1}</Badge>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onDone} className="flex-1">
          <BookOpen size={14} /> Back to Labs
        </Button>
        <Button variant="primary" onClick={onRetry} className="flex-1">
          <RotateCcw size={14} /> Retry Lab
        </Button>
      </div>
    </div>
  )
}