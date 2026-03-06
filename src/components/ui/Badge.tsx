import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange'
  size?: 'sm' | 'md'
}

export function Badge({ className = '', variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const v = variant === 'orange' ? 'warning' : variant
  const classes = ['badge', `badge-${v}`, size === 'sm' ? 'badge-sm' : '', className].filter(Boolean).join(' ')
  return <span className={classes} {...props}>{children}</span>
}