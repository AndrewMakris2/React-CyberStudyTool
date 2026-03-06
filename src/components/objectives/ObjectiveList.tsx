import type { Cert, ObjectiveProgress, ObjectiveStatus } from '../../types'
import DomainAccordion from './DomainAccordion'
import { Progress } from '../ui/Progress'
import { Card } from '../ui/Card'

interface ObjectiveListProps {
  cert: Cert
  progressItems: ObjectiveProgress[]
  onStatusChange: (objectiveId: string, certId: string, status: ObjectiveStatus) => void
}

export default function ObjectiveList({ cert, progressItems, onStatusChange }: ObjectiveListProps) {
  const progressMap = Object.fromEntries(
    progressItems.map(p => [p.objectiveId, p.status])
  ) as Record<string, ObjectiveStatus>

  const allObjectives = cert.domains.flatMap(d => d.objectives)
  const mastered = allObjectives.filter(o => progressMap[o.id] === 'mastered').length
  const total = allObjectives.length
  const overallPct = total > 0 ? Math.round((mastered / total) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Overall progress card */}
      <Card variant="elevated" padding="md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: '4px' }}>
              {cert.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#666' }}>
              {mastered} of {total} objectives mastered
            </p>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {overallPct}%
          </div>
        </div>
        <Progress
          value={overallPct}
          color={overallPct >= 80 ? 'green' : overallPct >= 50 ? 'yellow' : 'purple'}
          size="md"
        />
      </Card>

      {/* Domains */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cert.domains.map(domain => (
          <DomainAccordion
            key={domain.id}
            domain={domain}
            progressMap={progressMap}
            onStatusChange={(objId, status) => onStatusChange(objId, cert.id, status)}
          />
        ))}
      </div>
    </div>
  )
}