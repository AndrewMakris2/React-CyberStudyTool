import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Domain, ObjectiveStatus } from '../../types'
import ObjectiveStatusBadge from './ObjectiveStatusBadge'
import { Progress } from '../ui/Progress'

interface DomainAccordionProps {
  domain: Domain
  progressMap: Record<string, ObjectiveStatus>
  onStatusChange: (objectiveId: string, status: ObjectiveStatus) => void
}

const STATUS_CYCLE: ObjectiveStatus[] = ['not-started', 'learning', 'review', 'mastered']

export default function DomainAccordion({ domain, progressMap, onStatusChange }: DomainAccordionProps) {
  const [open, setOpen] = useState(false)
  const [headerHovered, setHeaderHovered] = useState(false)

  const mastered = domain.objectives.filter(o => progressMap[o.id] === 'mastered').length
  const total = domain.objectives.length
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

  const cycleStatus = (objectiveId: string) => {
    const current = progressMap[objectiveId] ?? 'not-started'
    const idx = STATUS_CYCLE.indexOf(current)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onStatusChange(objectiveId, next)
  }

  return (
    <div style={{
      border: '1px solid #242424',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>

      {/* ── Accordion header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px 18px',
          background: headerHovered ? '#1e1e1e' : '#171717',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        {/* Chevron */}
        <span style={{ color: '#555', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {open
            ? <ChevronDown size={15} />
            : <ChevronRight size={15} />
          }
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#fff', fontSize: '13px', margin: 0 }}>
                {domain.name}
              </p>
              <p style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
                Weight: {domain.weight}% · {mastered}/{total} mastered
              </p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#888', flexShrink: 0 }}>
              {pct}%
            </span>
          </div>

          <div style={{ marginTop: '10px' }}>
            <Progress
              value={pct}
              color={pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'purple'}
              size="sm"
            />
          </div>
        </div>
      </button>

      {/* ── Objectives list ── */}
      {open && (
        <div>
          {domain.objectives.map((obj, i) => {
            const status = progressMap[obj.id] ?? 'not-started'
            return (
              <ObjectiveRow
                key={obj.id}
                obj={obj}
                status={status}
                isLast={i === domain.objectives.length - 1}
                onCycle={() => cycleStatus(obj.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Separate row component for hover state ──
function ObjectiveRow({
  obj,
  status,
  isLast,
  onCycle,
}: {
  obj: { id: string; code: string; title: string; description: string; keywords: string[] }
  status: ObjectiveStatus
  isLast: boolean
  onCycle: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px 18px',
        background: hovered ? '#161616' : '#111',
        borderTop: '1px solid #1f1f1f',
        transition: 'background 0.15s',
      }}
    >
      {/* Left: content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Code + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: '#22d3ee',
            background: 'rgba(8,145,178,0.12)',
            border: '1px solid rgba(8,145,178,0.2)',
            padding: '2px 7px',
            borderRadius: '5px',
            flexShrink: 0,
            fontWeight: 600,
          }}>
            {obj.code}
          </span>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#e0e0e0', margin: 0, lineHeight: 1.4 }}>
            {obj.title}
          </p>
        </div>

        {/* Description */}
        <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}>
          {obj.description}
        </p>

        {/* Keywords */}
        {obj.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
            {obj.keywords.slice(0, 6).map(kw => (
              <span key={kw} style={{
                fontSize: '11px',
                color: '#4a4a4a',
                background: '#1a1a1a',
                border: '1px solid #242424',
                padding: '2px 7px',
                borderRadius: '4px',
              }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: status badge */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <ObjectiveStatusBadge
          status={status}
          interactive
          onClick={onCycle}
        />
        <p style={{ fontSize: '10px', color: '#3a3a3a', margin: 0 }}>click to cycle</p>
      </div>
    </div>
  )
}