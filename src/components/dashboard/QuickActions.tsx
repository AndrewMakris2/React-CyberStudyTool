import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Dumbbell, Layers, FlaskConical, MessageSquare, ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../ui/Card'

const ACTIONS = [
  {
    label: '10-Question Drill',
    description: 'Quick practice session',
    icon: Dumbbell,
    color: '#22d3ee',
    bg: 'rgba(8,145,178,0.15)',
    bgHover: 'rgba(8,145,178,0.25)',
    path: '/practice',
    state: { quick: true },
  },
  {
    label: 'Review Due Cards',
    description: 'Spaced repetition review',
    icon: Layers,
    color: '#c084fc',
    bg: 'rgba(126,34,206,0.15)',
    bgHover: 'rgba(126,34,206,0.28)',
    path: '/flashcards',
    state: { study: true },
  },
  {
    label: 'Start a Lab',
    description: 'Hands-on simulation',
    icon: FlaskConical,
    color: '#fb923c',
    bg: 'rgba(194,65,12,0.15)',
    bgHover: 'rgba(194,65,12,0.28)',
    path: '/labs',
    state: {},
  },
  {
    label: 'Ask the Tutor',
    description: 'AI-powered tutoring',
    icon: MessageSquare,
    color: '#60a5fa',
    bg: 'rgba(29,78,216,0.15)',
    bgHover: 'rgba(29,78,216,0.28)',
    path: '/tutor',
    state: {},
  },
  {
    label: 'Take an Exam',
    description: 'Timed practice exam',
    icon: ClipboardList,
    color: '#4ade80',
    bg: 'rgba(21,128,61,0.15)',
    bgHover: 'rgba(21,128,61,0.28)',
    path: '/exam',
    state: {},
  },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
      }}>
        {ACTIONS.map(action => (
          <ActionButton
            key={action.label}
            action={action}
            onClick={() => navigate(action.path, { state: action.state })}
          />
        ))}
      </div>
    </Card>
  )
}

// Separate component so we can use useState for hover
function ActionButton({
  action,
  onClick,
}: {
  action: typeof ACTIONS[number]
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
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: `1px solid ${hovered ? action.color + '55' : 'transparent'}`,
        background: hovered ? action.bgHover : action.bg,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        width: '100%',
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '9px',
        background: 'rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: action.color,
      }}>
        <action.icon size={18} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
        }}>
          {action.label}
        </p>
        <p style={{
          fontSize: '11px',
          color: action.color,
          opacity: 0.75,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: '2px 0 0',
        }}>
          {action.description}
        </p>
      </div>
    </button>
  )
}