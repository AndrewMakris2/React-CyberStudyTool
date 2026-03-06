import type { ObjectiveStatus } from '../../types'
import { Badge } from '../ui/Badge'

interface ObjectiveStatusBadgeProps {
  status: ObjectiveStatus
  onClick?: () => void
  interactive?: boolean
}

const STATUS_CONFIG = {
  'not-started': { label: 'Not Started', variant: 'default' as const },
  'learning':    { label: 'Learning',    variant: 'info' as const },
  'review':      { label: 'Review',      variant: 'warning' as const },
  'mastered':    { label: 'Mastered',    variant: 'success' as const },
}

export default function ObjectiveStatusBadge({ status, onClick, interactive }: ObjectiveStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge
      variant={config.variant}
      className={interactive ? 'cursor-pointer hover:opacity-80 transition-opacity select-none' : ''}
      onClick={onClick}
    >
      {config.label}
    </Badge>
  )
}