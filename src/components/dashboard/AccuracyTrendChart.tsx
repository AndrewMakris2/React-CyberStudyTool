import type { ExamAttempt } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts'

interface AccuracyTrendChartProps {
  attempts: ExamAttempt[]
}

export default function AccuracyTrendChart({ attempts }: AccuracyTrendChartProps) {
  const completed = attempts
    .filter(a => a.score)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .slice(-20)

  if (completed.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader><CardTitle>Accuracy Trend</CardTitle></CardHeader>
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
          Complete practice exams to see your trend
        </div>
      </Card>
    )
  }

  const data = completed.map((a, i) => ({
    attempt: i + 1,
    score: Math.round(a.score!.percentage),
    date: new Date(a.startedAt).toLocaleDateString(),
  }))

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Accuracy Trend</CardTitle>
        <span className="text-xs text-gray-400">Last {data.length} exams</span>
      </CardHeader>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
              formatter={(v: any) => [`${v}%`, 'Score']}
              labelFormatter={(l) => `Attempt ${l}`}
            />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Pass 75%', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}