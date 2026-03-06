import { Clock } from 'lucide-react'
import type { StudySession } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TimeSpentWidgetProps {
  sessions: StudySession[]
}

export default function TimeSpentWidget({ sessions }: TimeSpentWidgetProps) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const daySession = sessions.find(s => {
      const sd = new Date(s.date)
      sd.setHours(0, 0, 0, 0)
      return sd.getTime() === d.getTime()
    })
    return {
      day: label,
      minutes: daySession ? Math.round(daySession.durationSeconds / 60) : 0,
    }
  })

  const totalToday = last7[last7.length - 1].minutes
  const totalWeek = last7.reduce((sum, d) => sum + d.minutes, 0)

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={18} className="text-green-400" />
          Time Spent
        </CardTitle>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{totalToday}m</div>
          <div className="text-xs text-gray-400">today</div>
        </div>
      </CardHeader>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
              formatter={(v: any) => [`${v} min`, 'Study time']}
            />
            <Bar dataKey="minutes" fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {totalWeek} minutes this week
      </p>
    </Card>
  )
}