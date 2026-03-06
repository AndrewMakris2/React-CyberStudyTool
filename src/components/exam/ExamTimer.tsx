import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ExamTimerProps {
  seconds: number
  totalSeconds: number
}

export default function ExamTimer({ seconds, totalSeconds }: ExamTimerProps) {
  const pct = (seconds / totalSeconds) * 100
  const isWarning = pct < 20
  const isDanger = pct < 10

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold',
      isDanger ? 'bg-red-900/30 border-red-700 text-red-400 animate-pulse' :
      isWarning ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400' :
      'bg-gray-800 border-gray-700 text-gray-300'
    )}>
      {isDanger ? <AlertTriangle size={16} /> : <Clock size={16} />}
      {format(seconds)}
    </div>
  )
}