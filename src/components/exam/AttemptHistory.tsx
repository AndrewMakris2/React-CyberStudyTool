import { Trophy, Clock, Calendar } from 'lucide-react'
import type { ExamAttempt } from '../../types'
import { CERTS_DATA } from '../../data/objectives'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface AttemptHistoryProps {
  attempts: ExamAttempt[]
}

export default function AttemptHistory({ attempts }: AttemptHistoryProps) {
  if (!attempts.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Trophy size={40} className="mx-auto mb-3 opacity-30" />
        <p>No exam attempts yet</p>
        <p className="text-sm mt-1">Complete an exam to see your history</p>
      </div>
    )
  }

  const completed = attempts
    .filter(a => a.score)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())

  const chartData = completed.map((a, i) => ({
    attempt: i + 1,
    score: Math.round(a.score!.percentage),
  }))

  return (
    <div className="flex flex-col gap-4">
      {chartData.length > 1 && (
        <div className="h-48 bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Score Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                formatter={(v: any) => [`${v}%`, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {[...attempts].reverse().slice(0, 10).map(attempt => {
          const cert = CERTS_DATA.find(c => c.id === attempt.certId)
          const score = attempt.score
          const date = new Date(attempt.startedAt)

          return (
            <div key={attempt.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-white text-sm">{cert?.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {date.toLocaleDateString()}
                    </span>
                    {score && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {Math.floor(score.timeTakenSeconds / 60)}m {score.timeTakenSeconds % 60}s
                      </span>
                    )}
                    <span>{attempt.config.questionCount} questions</span>
                  </div>
                </div>
                {score ? (
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      score.percentage >= 75 ? 'text-green-400' :
                      score.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(score.percentage)}%
                    </div>
                    <Badge
                      variant={score.percentage >= 75 ? 'success' : 'danger'}
                      size="sm"
                    >
                      {score.percentage >= 75 ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="warning" size="sm">Incomplete</Badge>
                )}
              </div>

              {score && (
                <Progress
                  value={score.percentage}
                  color={score.percentage >= 75 ? 'green' : score.percentage >= 60 ? 'yellow' : 'red'}
                  size="sm"
                />
              )}

              {score && score.domainBreakdown.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {score.domainBreakdown.map(d => (
                    <div key={d.domainId} className="text-xs text-gray-400">
                      <span className={d.percentage >= 75 ? 'text-green-400' : 'text-red-400'}>
                        {Math.round(d.percentage)}%
                      </span>
                      {' '}{d.domainName.split(' ').slice(0, 2).join(' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}