import { Trophy, Target, TrendingDown, BookOpen } from 'lucide-react'
import type { ExamScore, PracticeQuestion } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'
import { Button } from '../ui/Button'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'

interface ScoreReportProps {
  score: ExamScore
  questions: PracticeQuestion[]
  answers: Record<number, string[]>
  onRetry: () => void
  onReview: () => void
  onDone: () => void
}

export default function ScoreReport({ score, questions, answers, onRetry, onReview, onDone }: ScoreReportProps) {
  const passed = score.percentage >= 75
  const timeTaken = `${Math.floor(score.timeTakenSeconds / 60)}m ${score.timeTakenSeconds % 60}s`

  const domainData = score.domainBreakdown.map(d => ({
    name: d.domainName.split(' ').slice(0, 3).join(' '),
    score: Math.round(d.percentage),
    fill: d.percentage >= 75 ? '#22c55e' : d.percentage >= 60 ? '#f59e0b' : '#ef4444',
  }))

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Main score */}
      <Card variant="elevated" className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
            passed ? 'border-green-500 text-green-400 bg-green-900/30' : 'border-red-500 text-red-400 bg-red-900/30'
          }`}>
            {Math.round(score.percentage)}%
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {passed ? '🎉 Practice Passed!' : '📚 Keep Studying'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {score.correctCount} of {score.totalQuestions} correct • {timeTaken}
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{score.correctCount}</div>
            <div className="text-xs text-gray-400">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{score.totalQuestions - score.correctCount}</div>
            <div className="text-xs text-gray-400">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{timeTaken}</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
        </div>
      </Card>

      {/* Domain breakdown */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Domain Breakdown</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3">
          {score.domainBreakdown.map(d => (
            <div key={d.domainId}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 truncate mr-4">{d.domainName}</span>
                <span className={d.percentage >= 75 ? 'text-green-400' : 'text-red-400'}>
                  {d.correct}/{d.total} ({Math.round(d.percentage)}%)
                </span>
              </div>
              <Progress
                value={d.percentage}
                color={d.percentage >= 75 ? 'green' : d.percentage >= 60 ? 'yellow' : 'red'}
                size="sm"
              />
            </div>
          ))}
        </div>

        {domainData.length > 0 && (
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {domainData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Weaknesses */}
      {score.objectiveWeaknesses.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown size={18} className="text-red-400" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {score.objectiveWeaknesses.map(id => (
              <Badge key={id} variant="danger" size="sm">{id}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onDone} className="flex-1">Dashboard</Button>
        <Button variant="outline" onClick={onReview} className="flex-1">
          <BookOpen size={14} /> Review Answers
        </Button>
        <Button variant="primary" onClick={onRetry} className="flex-1">
          <Target size={14} /> Try Again
        </Button>
      </div>
    </div>
  )
}