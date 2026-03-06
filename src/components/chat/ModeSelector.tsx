import { useState } from 'react'
import { Brain, BookOpen, Trophy } from 'lucide-react'
import type { TutorMode } from '../../types'

interface ModeSelectorProps {
  mode: TutorMode
  onChange: (mode: TutorMode) => void
}

const MODES = [
  {
    value: 'explain' as TutorMode,
    label: 'Explain',
    icon: <BookOpen size={14} />,
    color: '#60a5fa',
    bg: 'rgba(37,99,235,0.15)',
    bgHover: 'rgba(37,99,235,0.22)',
    border: 'rgba(37,99,235,0.4)',
  },
  {
    value: 'socratic' as TutorMode,
    label: 'Socratic',
    icon: <Brain size={14} />,
    color: '#c084fc',
    bg: 'rgba(126,34,206,0.15)',
    bgHover: 'rgba(126,34,206,0.22)',
    border: 'rgba(126,34,206,0.45)',
  },
  {
    value: 'exam-coach' as TutorMode,
    label: 'Exam Coach',
    icon: <Trophy size={14} />,
    color: '#fbbf24',
    bg: 'rgba(161,98,7,0.15)',
    bgHover: 'rgba(161,98,7,0.22)',
    border: 'rgba(161,98,7,0.4)',
  },
]

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {MODES.map(m => (
        <ModeBtn key={m.value} m={m} active={mode === m.value} onClick={() => onChange(m.value)} />
      ))}
    </div>
  )
}

function ModeBtn({
  m, active, onClick,
}: {
  m: typeof MODES[number]
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: `1px solid ${active ? m.border : hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        background: active ? m.bg : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        color: active ? m.color : hovered ? '#bbb' : '#555',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: active ? `0 0 12px ${m.bg}` : 'none',
      }}
    >
      <span style={{ color: active ? m.color : hovered ? '#888' : '#444', display: 'flex', alignItems: 'center' }}>
        {m.icon}
      </span>
      {m.label}
    </button>
  )
}