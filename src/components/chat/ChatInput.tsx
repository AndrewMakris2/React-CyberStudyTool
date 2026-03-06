import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onAbort?: () => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend, onAbort, loading, disabled, placeholder,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = value.trim() && !disabled && !loading

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      padding: '14px 16px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.2)',
      flexShrink: 0,
    }}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? 'Ask a question… (Enter to send, Shift+Enter for newline)'}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          background: focused
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused
            ? 'rgba(147,51,234,0.5)'
            : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '12px',
          padding: '11px 14px',
          fontSize: '13px',
          color: '#e0e0e0',
          resize: 'none',
          overflow: 'hidden',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          outline: 'none',
          transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
          boxShadow: focused ? '0 0 0 3px rgba(126,34,206,0.1)' : 'none',
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />

      {/* Send / Stop button */}
      {loading ? (
        <StopBtn onClick={onAbort} />
      ) : (
        <SendBtn onClick={handleSend} disabled={!canSend} />
      )}
    </div>
  )
}

function SendBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '11px',
        border: 'none',
        background: disabled
          ? 'rgba(126,34,206,0.15)'
          : hovered
          ? 'linear-gradient(135deg, #9333ea, #a855f7)'
          : 'linear-gradient(135deg, #7e22ce, #9333ea)',
        color: disabled ? '#444' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : hovered
          ? '0 4px 16px rgba(126,34,206,0.45)'
          : '0 2px 10px rgba(126,34,206,0.3)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
      }}
    >
      <Send size={15} />
    </button>
  )
}

function StopBtn({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '11px',
        border: 'none',
        background: hovered ? '#dc2626' : '#b91c1c',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 4px 14px rgba(220,38,38,0.4)' : '0 2px 8px rgba(185,28,28,0.3)',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <Square size={14} />
    </button>
  )
}