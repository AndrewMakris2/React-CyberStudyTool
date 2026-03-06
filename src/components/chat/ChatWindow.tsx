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

export default function ChatWindow() {
  const activeCertId   = useAppStore(s => s.activeCertId)
  const activeDomainId = useAppStore(s => s.activeDomainId)
  const tutorMode      = useAppStore(s => s.tutorMode)
  const setTutorMode   = useAppStore(s => s.setTutorMode)
  const tutorToggles   = useAppStore(s => s.tutorToggles)
  const setTutorToggle = useAppStore(s => s.setTutorToggle)
  const chatMessages   = useAppStore(s => s.chatMessages)
  const addChatMessage = useAppStore(s => s.addChatMessage)
  const clearChat      = useAppStore(s => s.clearChat)
  const setChatStreaming= useAppStore(s => s.setChatStreaming)
  const groqApiKey     = useSettingsStore(s => s.groqApiKey)

  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming]             = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const cert   = CERTS_DATA.find(c => c.id === activeCertId)
  const domain = cert?.domains.find(d => d.id === activeDomainId)

  const { send, loading, error, abort } = useGroq({
    onChunk: chunk => setStreamingContent(prev => prev + chunk),
    onComplete: full => {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: full,
        timestamp: new Date(),
        mode: tutorMode,
      })
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
    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    })
    setIsStreaming(true)
    setChatStreaming(true)
    setStreamingContent('')

    const knowledgeItems = await getKnowledgeItems(activeCertId)
    const context = retrieveRelevantContext(userText, knowledgeItems)
    const systemPrompt = buildTutorSystemPrompt(tutorMode, activeCertId, domain?.name ?? null, tutorToggles)
    const userPrompt   = buildTutorUserPrompt(userText, context || null)
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
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `chat-export-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: '16px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
              AI Tutor
            </p>
            <p style={{ fontSize: '11px', color: '#444', margin: '2px 0 0' }}>
              {cert?.name}{domain ? ` › ${domain.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconBtn
              onClick={handleExport}
              disabled={chatMessages.length === 0}
              title="Export chat"
            >
              <Download size={15} />
            </IconBtn>
            <IconBtn
              onClick={clearChat}
              disabled={chatMessages.length === 0}
              title="Clear chat"
              danger
            >
              <Trash2 size={15} />
            </IconBtn>
          </div>
        </div>

        {/* Mode selector */}
        <ModeSelector mode={tutorMode} onChange={setTutorMode} />

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <InlineToggle
            checked={tutorToggles.showSteps}
            onChange={v => setTutorToggle('showSteps', v)}
            label="Show Steps"
          />
          <InlineToggle
            checked={tutorToggles.citeSources}
            onChange={v => setTutorToggle('citeSources', v)}
            label="Cite Sources"
          />
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* No API key */}
        {!groqApiKey && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(161,98,7,0.08)',
            border: '1px solid rgba(161,98,7,0.2)',
            fontSize: '13px',
            color: '#92400e',
          }}>
            ⚠️ Add your Groq API key in Settings to start chatting.
          </div>
        )}

        {/* Empty state */}
        {chatMessages.length === 0 && groqApiKey && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '48px 0',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '16px',
            }}>
              🤖
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e0e0e0', margin: '0 0 8px' }}>
              Start a conversation
            </h3>
            <p style={{ fontSize: '13px', color: '#444', maxWidth: '320px', lineHeight: 1.6, margin: 0 }}>
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

        {/* Typing dots */}
        {isStreaming && !streamingContent && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              flexShrink: 0,
            }}>
              🤖
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 16px',
              display: 'flex',
              gap: '5px',
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#555',
                    animation: 'bounce 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(185,28,28,0.1)',
            border: '1px solid rgba(185,28,28,0.25)',
            fontSize: '13px',
            color: '#f87171',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <ChatInput
        onSend={handleSend}
        onAbort={handleAbort}
        loading={loading || isStreaming}
        disabled={!groqApiKey}
      />
    </div>
  )
}

// ── Small icon button ────────────────────────────────────────────────────────
function IconBtn({
  onClick, disabled, title, danger, children,
}: {
  onClick: () => void
  disabled?: boolean
  title?: string
  danger?: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: 'none',
        padding: '6px',
        borderRadius: '7px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled
          ? '#2a2a2a'
          : hovered
          ? danger ? '#f87171' : '#e0e0e0'
          : '#3a3a3a',
        transition: 'color 0.15s, background 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered && !disabled
          ? danger ? 'rgba(185,28,28,0.12)' : 'rgba(255,255,255,0.06)'
          : 'transparent',
      } as React.CSSProperties}
    >
      {children}
    </button>
  )
}

// ── Inline toggle (replaces Toggle component) ────────────────────────────────
function InlineToggle({
  checked, onChange, label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          width: '36px',
          height: '20px',
          borderRadius: '999px',
          background: checked ? '#7e22ce' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${checked ? '#7e22ce' : 'rgba(255,255,255,0.12)'}`,
          transition: 'all 0.2s',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: checked ? '0 0 10px rgba(126,34,206,0.35)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '17px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <span style={{ fontSize: '12px', color: checked ? '#c084fc' : '#555', transition: 'color 0.15s' }}>
        {label}
      </span>
    </label>
  )
}