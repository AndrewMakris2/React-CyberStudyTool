interface ProgressProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'green' | 'yellow' | 'red' | 'cyan'
  className?: string
}

export function Progress({ value, max = 100, label, showPercent, size = 'md', color = 'purple', className = '' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`progress-wrap ${className}`}>
      {(label || showPercent) && (
        <div className="progress-header">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`progress-track progress-track-${size}`}>
        <div className={`progress-bar progress-${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}