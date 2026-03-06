import { useState } from 'react'
import { RefreshCw, Save, Sparkles } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { groqChat } from '../llm/groqClient'
import { buildQuestionGenSystemPrompt, buildQuestionGenUserPrompt } from '../prompts/questionGen'
import { savePracticeQuestions } from '../db'
import { CERTS_DATA } from '../data/objectives'
import type { PracticeQuestion, QuestionType, Difficulty, CertId } from '../types'
import QuestionCard from '../components/practice/QuestionCard'

const TYPE_OPTIONS: { value: QuestionType; label: string; desc: string }[] = [
  { value: 'multiple-choice',   label: 'Multiple Choice',       desc: 'Single best answer' },
  { value: 'multiple-response', label: 'Multiple Response',     desc: 'Select all that apply' },
  { value: 'scenario',          label: 'Scenario-Based',        desc: 'Real-world situation' },
  { value: 'pbq',               label: 'Performance-Based',     desc: 'PBQ simulation' },
]

export default function PracticePage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast    = useAppStore(s => s.showToast)
  const groqApiKey   = useSettingsStore(s => s.groqApiKey)

  const [domainId,    setDomainId]    = useState('')
  const [difficulty,  setDifficulty]  = useState<Difficulty | 'mixed'>('mixed')
  const [count,       setCount]       = useState(10)
  const [types,       setTypes]       = useState<QuestionType[]>(['multiple-choice', 'scenario'])
  const [generating,  setGenerating]  = useState(false)
  const [questions,   setQuestions]   = useState<PracticeQuestion[]>([])
  const [currentIndex,setCurrentIndex]= useState(0)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)
  const [mode,        setMode]        = useState<'config' | 'practice' | 'done'>('config')

  const cert = CERTS_DATA.find(c => c.id === activeCertId)

  const toggleType = (t: QuestionType) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const handleGenerate = async () => {
    if (!groqApiKey) { setError('Add your Groq API key in Settings.'); return }
    if (types.length === 0) { setError('Select at least one question type.'); return }
    setGenerating(true)
    setError(null)
    setSaved(false)
    try {
      const domains = domainId
        ? [cert?.domains.find(d => d.id === domainId)?.name ?? '']
        : cert?.domains.map(d => d.name) ?? []

      const response = await groqChat({
        messages: [
          { role: 'system', content: buildQuestionGenSystemPrompt() },
          { role: 'user',   content: buildQuestionGenUserPrompt(activeCertId as CertId, domains, difficulty, count, types) },
        ],
        maxTokens: 4000,
        temperature: 0.7,
      })

      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Invalid response format from AI')
      const parsed: any[] = JSON.parse(jsonMatch[0])
      const now = new Date()
      const qs: PracticeQuestion[] = parsed.map(q => ({
        certId: activeCertId as CertId,
        domainId: domainId || cert?.domains[0]?.id || '',
        objectiveIds: (q.objectiveCodes ?? []).map((c: string) => `${activeCertId}-${c}`),
        type: q.type ?? 'multiple-choice',
        difficulty: q.difficulty ?? 'medium',
        stem: q.stem ?? '',
        options: q.options ?? [],
        correctAnswers: q.correctAnswers ?? [],
        explanation: q.explanation ?? '',
        wrongAnswerExplanations: q.wrongAnswerExplanations ?? {},
        tags: q.tags ?? [],
        createdAt: now,
      }))
      setQuestions(qs)
      setCurrentIndex(0)
      setMode('practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (questions.length === 0) return
    await savePracticeQuestions(questions)
    setSaved(true)
    showToast(`${questions.length} questions saved!`, 'success')
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1)
    else setMode('done')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '780px',
      margin: '0 auto',
    }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Practice Questions
        </h1>
        <p style={{ fontSize: '13px', color: '#4a4a4a', marginTop: '5px' }}>
          Generate AI-powered practice questions tailored to your cert and domains.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(185,28,28,0.1)',
          border: '1px solid rgba(185,28,28,0.25)',
          fontSize: '13px',
          color: '#f87171',
        }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {/* ══════════════════════════════════════
          CONFIG MODE
      ══════════════════════════════════════ */}
      {mode === 'config' && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
              Configure Question Set
            </h2>
            <p style={{ fontSize: '12px', color: '#4a4a4a', marginTop: '5px' }}>
              {cert?.name} · {count} questions
            </p>
          </div>

          {/* Domain + Difficulty row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ConfigSelect
              label="Domain"
              value={domainId}
              onChange={setDomainId}
              options={[
                { value: '', label: 'All Domains' },
                ...(cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []),
              ]}
            />
            <ConfigSelect
              label="Difficulty"
              value={difficulty}
              onChange={v => setDifficulty(v as Difficulty | 'mixed')}
              options={[
                { value: 'mixed',  label: 'Mixed' },
                { value: 'easy',   label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard',   label: 'Hard' },
              ]}
            />
          </div>

          {/* Count */}
          <ConfigSelect
            label="Number of Questions"
            value={String(count)}
            onChange={v => setCount(Number(v))}
            options={[5, 10, 15, 20, 25].map(n => ({ value: String(n), label: `${n} questions` }))}
          />

          {/* Question types */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#555',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Question Types
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TYPE_OPTIONS.map(t => (
                <TypeToggle
                  key={t.value}
                  label={t.label}
                  desc={t.desc}
                  selected={types.includes(t.value)}
                  onToggle={() => toggleType(t.value)}
                />
              ))}
            </div>
          </div>

          {/* No API key warning */}
          {!groqApiKey && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(161,98,7,0.08)',
              border: '1px solid rgba(161,98,7,0.2)',
              fontSize: '12px',
              color: '#92400e',
            }}>
              ⚠️ Add your Groq API key in Settings to generate questions.
            </div>
          )}

          {/* Generate button */}
          <GenerateButton
            onClick={handleGenerate}
            loading={generating}
            disabled={!groqApiKey || types.length === 0}
            count={count}
          />
        </div>
      )}

      {/* ══════════════════════════════════════
          PRACTICE MODE
      ══════════════════════════════════════ */}
      {mode === 'practice' && questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Progress bar + actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              {/* Progress */}
              <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>
                {currentIndex + 1} / {questions.length}
              </span>
              <div style={{
                flex: 1,
                height: '4px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #7e22ce, #9333ea)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <SmallBtn onClick={() => setMode('config')} icon={<RefreshCw size={13} />}>
                New Set
              </SmallBtn>
              {!saved && (
                <SmallBtn onClick={handleSave} icon={<Save size={13} />} accent>
                  Save to Bank
                </SmallBtn>
              )}
            </div>
          </div>

          <QuestionCard
            question={questions[currentIndex]}
            index={currentIndex}
            total={questions.length}
            onNext={handleNext}
          />
        </div>
      )}

      {/* ══════════════════════════════════════
          DONE MODE
      ══════════════════════════════════════ */}
      {mode === 'done' && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', lineHeight: 1 }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Practice Set Complete!
          </h2>
          <p style={{ fontSize: '13px', color: '#4a4a4a', marginBottom: '36px' }}>
            You finished all {questions.length} questions.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => { setCurrentIndex(0); setMode('practice') }}
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#aaa',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Review Again
            </button>
            <button
              onClick={() => { setMode('config'); setQuestions([]) }}
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7e22ce, #9333ea)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(126,34,206,0.35)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={14} /> Generate New Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConfigSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#555',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '10px 32px 10px 13px',
          fontSize: '13px',
          color: '#ddd',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          width: '100%',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(147,51,234,0.5)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#1a1a1a' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TypeToggle({
  label, desc, selected, onToggle,
}: {
  label: string
  desc: string
  selected: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '3px',
        padding: '12px 14px',
        borderRadius: '11px',
        border: selected
          ? '1px solid rgba(147,51,234,0.5)'
          : hovered
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(255,255,255,0.07)',
        background: selected
          ? 'rgba(126,34,206,0.12)'
          : hovered
          ? 'rgba(255,255,255,0.03)'
          : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 16px rgba(126,34,206,0.12)' : 'none',
      }}
    >
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: selected ? '#c084fc' : '#bbb',
        transition: 'color 0.15s',
      }}>
        {label}
      </span>
      <span style={{ fontSize: '11px', color: '#444' }}>{desc}</span>
    </button>
  )
}

function GenerateButton({
  onClick, loading, disabled, count,
}: {
  onClick: () => void
  loading: boolean
  disabled: boolean
  count: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        background: disabled
          ? 'rgba(126,34,206,0.2)'
          : hovered
          ? 'linear-gradient(135deg, #9333ea, #a855f7)'
          : 'linear-gradient(135deg, #7e22ce, #9333ea)',
        border: 'none',
        color: disabled ? '#555' : '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : hovered
          ? '0 8px 28px rgba(126,34,206,0.5)'
          : '0 4px 20px rgba(126,34,206,0.3)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '-0.01em',
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.65s linear infinite',
            flexShrink: 0,
          }} />
          Generating…
        </>
      ) : (
        <>
          <Sparkles size={15} />
          Generate {count} Questions
        </>
      )}
    </button>
  )
}

function SmallBtn({
  onClick, children, icon, accent,
}: {
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
  accent?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 13px',
        borderRadius: '9px',
        background: accent
          ? hovered ? 'rgba(126,34,206,0.25)' : 'rgba(126,34,206,0.15)'
          : hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: accent
          ? '1px solid rgba(147,51,234,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
        color: accent ? '#c084fc' : '#777',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {icon}
      {children}
    </button>
  )
}