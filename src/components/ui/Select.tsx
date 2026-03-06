import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption { value: string; label: string; disabled?: boolean }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  label?: string
  error?: string
  placeholder?: string
}

export function Select({ options, label, error, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrapper">
        <select
          className={`form-select ${className}`}
          style={{ borderColor: error ? '#dc2626' : undefined }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}
              style={{ backgroundColor: '#1a1a1a' }}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="input-icon-right" style={{ pointerEvents: 'none' }}>
          <ChevronDown size={14} />
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}