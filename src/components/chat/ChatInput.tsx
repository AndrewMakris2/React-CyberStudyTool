import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ChatInputProps {
  onSend: (message: string) => void
  onAbort?: () => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, onAbort, loading, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
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

  return (
    <div className="flex items-end gap-3 p-4 border-t border-gray-700 bg-gray-900">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Ask a question... (Enter to send, Shift+Enter for newline)'}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-2.5 text-sm',
          'placeholder:text-gray-500 resize-none overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      {loading ? (
        <button
          onClick={onAbort}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors"
          title="Stop generating"
        >
          <Square size={14} className="text-white" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Send size={14} className="text-white" />
        </button>
      )}
    </div>
  )
}