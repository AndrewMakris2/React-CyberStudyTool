import React from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const icons = {
    info:    <Info size={16} className="alert-icon" />,
    success: <CheckCircle size={16} className="alert-icon" />,
    warning: <AlertTriangle size={16} className="alert-icon" />,
    danger:  <XCircle size={16} className="alert-icon" />,
  }
  return (
    <div className={`alert alert-${variant} ${className}`}>
      {icons[variant]}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p className="alert-title">{title}</p>}
        <div style={{ fontSize: 13, opacity: 0.9 }}>{children}</div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}><X size={14} /></button>
      )}
    </div>
  )
}