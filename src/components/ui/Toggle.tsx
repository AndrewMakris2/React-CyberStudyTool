interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={`toggle-label ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        style={{ display: 'none' }}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`toggle-track ${checked ? 'on' : ''}`}>
        <div className="toggle-thumb" />
      </div>
      {(label || description) && (
        <div>
          {label && <div className="toggle-text-label">{label}</div>}
          {description && <div className="toggle-text-desc">{description}</div>}
        </div>
      )}
    </label>
  )
}