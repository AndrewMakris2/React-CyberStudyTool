import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'purple'
  trend?: { value: number; label: string }
}

const COLOR_MAP = {
  cyan:   { icon: '#22d3ee', bg: 'rgba(8,145,178,0.15)',   text: '#22d3ee' },
  green:  { icon: '#4ade80', bg: 'rgba(21,128,61,0.15)',   text: '#4ade80' },
  yellow: { icon: '#fbbf24', bg: 'rgba(161,98,7,0.15)',    text: '#fbbf24' },
  red:    { icon: '#f87171', bg: 'rgba(185,28,28,0.15)',   text: '#f87171' },
  purple: { icon: '#c084fc', bg: 'rgba(126,34,206,0.15)',  text: '#c084fc' },
}

export default function StatsCard({
  title, value, subtitle, icon: Icon, color = 'cyan', trend
}: StatsCardProps) {
  const c = COLOR_MAP[color]

  return (
    <Card variant="elevated">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Top row: label + icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, margin: 0 }}>
            {title}
          </p>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: c.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.icon,
            flexShrink: 0,
          }}>
            <Icon size={17} />
          </div>
        </div>

        {/* Value + subtitle */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
            {value}
          </div>
          {subtitle && (
            <p style={{ fontSize: '11px', color: '#4a4a4a', marginTop: '5px' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional trend */}
        {trend && (
          <p style={{ fontSize: '11px', fontWeight: 500, color: c.text, margin: 0 }}>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
    </Card>
  )
}