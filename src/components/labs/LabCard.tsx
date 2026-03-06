import { Clock, ChevronRight, FlaskConical } from 'lucide-react'
import type { Lab } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

interface LabCardProps {
  lab: Lab
  onStart: (lab: Lab) => void
  completed?: boolean
  lastScore?: number
}

const LAB_TYPE_COLORS: Record<string, string> = {
  'log-analysis': 'text-cyan-400',
  'network-troubleshooting': 'text-blue-400',
  'incident-response': 'text-red-400',
  'threat-modeling': 'text-purple-400',
  'vulnerability-triage': 'text-orange-400',
}

const LAB_TYPE_LABELS: Record<string, string> = {
  'log-analysis': 'Log Analysis',
  'network-troubleshooting': 'Network Troubleshooting',
  'incident-response': 'Incident Response',
  'threat-modeling': 'Threat Modeling',
  'vulnerability-triage': 'Vulnerability Triage',
}

export default function LabCard({ lab, onStart, completed, lastScore }: LabCardProps) {
  const difficultyVariant = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
  } as const

  return (
    <Card variant="elevated" className="flex flex-col gap-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center',
            LAB_TYPE_COLORS[lab.type]
          )}>
            <FlaskConical size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{lab.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{LAB_TYPE_LABELS[lab.type]}</p>
          </div>
        </div>
        {completed && lastScore !== undefined && (
          <div className="text-right flex-shrink-0">
            <div className={`text-lg font-bold ${lastScore >= 75 ? 'text-green-400' : lastScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {lastScore}%
            </div>
            <div className="text-xs text-gray-500">Last score</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={difficultyVariant[lab.difficulty]}>{lab.difficulty}</Badge>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {lab.estimatedMinutes} min
        </div>
        {completed && (
          <Badge variant="success" size="sm">Completed</Badge>
        )}
      </div>

      <p className="text-sm text-gray-400 line-clamp-2">{lab.scenario.slice(0, 150)}...</p>

      <Button
        variant={completed ? 'secondary' : 'primary'}
        size="sm"
        onClick={() => onStart(lab)}
        rightIcon={<ChevronRight size={14} />}
        className="mt-auto"
      >
        {completed ? 'Retry Lab' : 'Start Lab'}
      </Button>
    </Card>
  )
}