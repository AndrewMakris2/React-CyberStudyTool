import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'
import { cn } from '../../utils/cn'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser ? 'bg-cyan-600' : 'bg-gray-700'
      )}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-cyan-400" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] relative', isUser ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm',
          isUser
            ? 'bg-cyan-600 text-white rounded-tr-sm'
            : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-cyber">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={cn(
          'flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Copy message"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          <span className="text-xs text-gray-600">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}