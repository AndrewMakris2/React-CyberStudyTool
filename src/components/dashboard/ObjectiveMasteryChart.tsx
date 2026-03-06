import { CERTS_DATA } from '../../data/objectives'
import type { ObjectiveProgress } from '../../types'
import { Progress } from '../ui/Progress'
import { Badge } from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'

interface ObjectiveMasteryChartProps {
  certId: string
  progressItems: ObjectiveProgress[]
}

export default function ObjectiveMasteryChart({ certId, progressItems }: ObjectiveMasteryChartProps) {
  const cert = CERTS_DATA.find(c => c.id === certId)
  if (!cert) return null

  const progressMap = Object.fromEntries(progressItems.map(p => [p.objectiveId, p.status]))

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Domain Mastery</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          {(['not-started', 'learning', 'review', 'mastered'] as const).map(s => (
            <div key={s} className="flex items-center gap-1 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${
                s === 'mastered' ? 'bg-green-500' :
                s === 'review' ? 'bg-yellow-500' :
                s === 'learning' ? 'bg-blue-500' : 'bg-gray-600'
              }`} />
              {s.replace('-', ' ')}
            </div>
          ))}
        </div>
      </CardHeader>

      <div className="flex flex-col gap-5">
        {cert.domains.map(domain => {
          const objectives = domain.objectives
          const total = objectives.length
          const mastered = objectives.filter(o => progressMap[o.id] === 'mastered').length
          const review = objectives.filter(o => progressMap[o.id] === 'review').length
          const learning = objectives.filter(o => progressMap[o.id] === 'learning').length
          const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

          return (
            <div key={domain.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-200">{domain.name}</p>
                  <p className="text-xs text-gray-500">Weight: {domain.weight}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {learning > 0 && <Badge variant="info" size="sm">{learning} learning</Badge>}
                  {review > 0 && <Badge variant="warning" size="sm">{review} review</Badge>}
                  {mastered > 0 && <Badge variant="success" size="sm">{mastered} mastered</Badge>}
                </div>
              </div>
              <Progress
                value={pct}
                label={`${mastered}/${total} objectives mastered`}
                showPercent
                color={pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'cyan'}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}