import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', style, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <div className="input-wrapper">
          {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            className={`form-input ${className}`}
            style={{
              paddingLeft: leftIcon ? 34 : undefined,
              paddingRight: rightIcon ? 34 : undefined,
              borderColor: error ? '#dc2626' : undefined,
              ...style,
            }}
            {...props}
          />
          {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'