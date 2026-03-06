import { useEffect, useRef, useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useGroq } from '../../hooks/useGroq'
import { getKnowledgeItems } from '../../db'
import { buildTutorSystemPrompt, buildTutorUserPrompt } from '../../prompts/tutor'
import { retrieveRelevantContext } from '../../utils/search'
import { CERTS_DATA } from '../../data/objectives'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ModeSelector from './ModeSelector'
import { Toggle } from '../ui/Toggle'
import { Alert } from '../ui/Alert'
import type { ChatMessage as ChatMessageType } from '../../types'

export default function ChatWindow() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const activeDomainId = useAppStore(s => s.activeDomainId)
  const tutorMode = useAppStore(s => s.tutorMode)
  const setTutorMode = useAppStore(s => s.setTutorMode)
  const tutorToggles = useAppStore(s => s.tutorToggles)
  const setTutorToggle = useAppStore(s => s.setTutorToggle)
  const chatMessages = useAppStore(s => s.chatMessages)
  const addChatMessage = useAppStore(s => s.addChatMessage)
  const clearChat = useAppStore(s => s.clearChat)
  const setChatStreaming = useAppStore(s => s.setChatStreaming)
  const groqApiKey = useSettingsStore(s => s.groqApiKey)

  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const cert = CERTS_DATA.find(c => c.id === activeCertId)
  const domain = cert?.domains.find(d => d.id === activeDomainId)

  const { send, loading, error, abort } = useGroq({
    onChunk: (chunk) => setStreamingContent(prev => prev + chunk),
    onComplete: (full) => {
      const msg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: full,
        timestamp: new Date(),
        mode: tutorMode,
      }
      addChatMessage(msg)
      setStreamingContent('')
      setIsStreaming(false)
      setChatStreaming(false)
    },
    onError: () => {
      setStreamingContent('')
      setIsStreaming(false)
      setChatStreaming(false)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, streamingContent])

  const handleSend = async (userText: string) => {
    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }
    addChatMessage(userMsg)
    setIsStreaming(true)
    setChatStreaming(true)
    setStreamingContent('')

    const knowledgeItems = await getKnowledgeItems(activeCertId)
    const context = retrieveRelevantContext(userText, knowledgeItems)

    const systemPrompt = buildTutorSystemPrompt(tutorMode, activeCertId, domain?.name ?? null, tutorToggles)
    const userPrompt = buildTutorUserPrompt(userText, context || null)

    const history = chatMessages.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }))

    await send([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userPrompt },
    ], { maxTokens: 2048 })
  }

  const handleAbort = () => {
    abort()
    setStreamingContent('')
    setIsStreaming(false)
    setChatStreaming(false)
  }

  const handleExport = () => {
    const text = chatMessages
      .map(m => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">AI Tutor</h2>
            <p className="text-xs text-gray-400">
              {cert?.name}{domain ? ` › ${domain.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={chatMessages.length === 0}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              title="Export chat"
            >
              <Download size={16} />
            </button>
            <button
              onClick={clearChat}
              disabled={chatMessages.length === 0}
              className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <ModeSelector mode={tutorMode} onChange={setTutorMode} />

        {/* Toggles */}
        <div className="flex gap-4 mt-3">
          <Toggle
            size="sm"
            checked={tutorToggles.showSteps}
            onChange={v => setTutorToggle('showSteps', v)}
            label="Show Steps"
          />
          <Toggle
            size="sm"
            checked={tutorToggles.citeSources}
            onChange={v => setTutorToggle('citeSources', v)}
            label="Cite Sources"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {!groqApiKey && (
          <Alert variant="warning" title="No API Key">
            Add your Groq API key in Settings to start chatting.
          </Alert>
        )}

        {chatMessages.length === 0 && groqApiKey && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Ask me anything about {cert?.name}. I'll adapt to your chosen mode: {tutorMode}.
            </p>
          </div>
        )}

        {chatMessages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: new Date(),
            }}
          />
        )}

        {/* Streaming indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="danger" title="Error">
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onAbort={handleAbort}
        loading={loading || isStreaming}
        disabled={!groqApiKey}
      />
    </div>
  )
}