import { Brain, BookOpen, Trophy } from 'lucide-react'
import type { TutorMode } from '../../types'
import { cn } from '../../utils/cn'

interface ModeSelectorProps {
  mode: TutorMode
  onChange: (mode: TutorMode) => void
}

const MODES: { value: TutorMode; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'explain',
    label: 'Explain',
    description: 'Clear teaching with examples',
    icon: <BookOpen size={16} />,
    color: 'text-blue-400 border-blue-600/50 bg-blue-900/20',
  },
  {
    value: 'socratic',
    label: 'Socratic',
    description: 'Guided discovery through questions',
    icon: <Brain size={16} />,
    color: 'text-purple-400 border-purple-600/50 bg-purple-900/20',
  },
  {
    value: 'exam-coach',
    label: 'Exam Coach',
    description: 'Exam traps & test strategy',
    icon: <Trophy size={16} />,
    color: 'text-yellow-400 border-yellow-600/50 bg-yellow-900/20',
  },
]

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map(m => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
            mode === m.value
              ? m.color + ' border-opacity-100'
              : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
          )}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  )
}