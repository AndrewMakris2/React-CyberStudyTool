import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'purple'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className = '', variant = 'default', padding = 'md', children, style, ...props }: CardProps) {
  const variantClass = variant === 'elevated' ? 'card-elevated' : variant === 'purple' ? 'card-purple' : 'card'
  const padMap = { none: '0', sm: '12px', md: '20px', lg: '28px' }
  return (
    <div
      className={`${variantClass} ${className}`}
      style={{ padding: padMap[padding], ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card-header ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`card-title ${className}`} {...props}>{children}</h3>
}

export function CardDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p style={{ fontSize: 13, color: '#888' }} className={className} {...props}>{children}</p>
}