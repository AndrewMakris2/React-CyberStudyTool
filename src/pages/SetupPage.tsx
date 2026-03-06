import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Key, Check, Eye, EyeOff, Zap, Brain, FlaskConical, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useAppStore } from '../store/useAppStore'
import { CERTS_DATA } from '../data/objectives'
import { testGroqKey } from '../llm/groqClient'
import type { CertId } from '../types'

// ── Minimal inline styles only — zero Tailwind ──────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,

  // Ambient glow blobs
  blob1: {
    position: 'absolute' as const,
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(126,34,206,0.12) 0%, transparent 70%)',
    top: '-200px',
    left: '-200px',
    pointerEvents: 'none' as const,
  },
  blob2: {
    position: 'absolute' as const,
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
    bottom: '-150px',
    right: '-150px',
    pointerEvents: 'none' as const,
  },

  container: {
    width: '100%',
    maxWidth: '520px',
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  },

  // ── Header ──
  header: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  logoRing: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #7e22ce, #9333ea)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 1px rgba(147,51,234,0.3), 0 0 40px rgba(126,34,206,0.4), 0 0 80px rgba(126,34,206,0.15)',
  },
  appName: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  appSub: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
    letterSpacing: '0.01em',
  },

  // ── Step indicators ──
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
  },
  stepDot: (active: boolean, done: boolean): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    transition: 'all 0.3s',
    background: done
      ? 'linear-gradient(135deg, #7e22ce, #9333ea)'
      : active
      ? 'rgba(147,51,234,0.2)'
      : 'rgba(255,255,255,0.04)',
    border: done
      ? '1px solid rgba(147,51,234,0.6)'
      : active
      ? '1px solid rgba(147,51,234,0.5)'
      : '1px solid rgba(255,255,255,0.08)',
    color: done ? '#fff' : active ? '#c084fc' : '#444',
    boxShadow: done || active ? '0 0 16px rgba(126,34,206,0.3)' : 'none',
  }),
  stepLine: (done: boolean): React.CSSProperties => ({
    width: '48px',
    height: '1px',
    background: done
      ? 'linear-gradient(90deg, #7e22ce, #9333ea)'
      : 'rgba(255,255,255,0.07)',
    transition: 'background 0.3s',
  }),

  // ── Card ──
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '36px',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '28px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },

  cardTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  cardSub: {
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.6,
    margin: '6px 0 0',
  },

  // ── Feature rows (step 1) ──
  featureRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  featureIcon: (color: string, bg: string): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    flexShrink: 0,
  }),
  featureTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e0e0e0',
    margin: 0,
  },
  featureDesc: {
    fontSize: '12px',
    color: '#4a4a4a',
    margin: '4px 0 0',
    lineHeight: 1.5,
  },

  // ── Warning box ──
  warningBox: {
    background: 'rgba(161,98,7,0.08)',
    border: '1px solid rgba(161,98,7,0.2)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  warningList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  warningItem: {
    fontSize: '12px',
    color: '#92400e',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
  },

  // ── Input ──
  inputWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '7px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#777',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  inputRow: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 44px 12px 14px',
    fontSize: '14px',
    color: '#f0f0f0',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    transition: 'color 0.15s',
  },

  // ── Test key button ──
  testBtn: (disabled: boolean, loading: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? '#333' : '#888',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
  }),

  // ── Result pill ──
  resultPill: (ok: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: ok ? 'rgba(21,128,61,0.1)' : 'rgba(185,28,28,0.1)',
    border: `1px solid ${ok ? 'rgba(21,128,61,0.25)' : 'rgba(185,28,28,0.25)'}`,
    fontSize: '13px',
    color: ok ? '#4ade80' : '#f87171',
  }),

  // ── Cert cards ──
  certGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  certCard: (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    borderRadius: '14px',
    border: selected
      ? '1px solid rgba(147,51,234,0.5)'
      : '1px solid rgba(255,255,255,0.07)',
    background: selected
      ? 'rgba(126,34,206,0.1)'
      : 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    position: 'relative',
    boxShadow: selected ? '0 0 20px rgba(126,34,206,0.15)' : 'none',
  } as React.CSSProperties),

  certDot: (color: string): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 8px ${color}`,
    flexShrink: 0,
  }),
  certCheck: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7e22ce, #9333ea)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(126,34,206,0.4)',
  },

  // ── Buttons ──
  btnRow: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimary: (disabled: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '13px 20px',
    borderRadius: '11px',
    background: disabled
      ? 'rgba(126,34,206,0.3)'
      : 'linear-gradient(135deg, #7e22ce, #9333ea)',
    border: 'none',
    color: disabled ? '#666' : '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '-0.01em',
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(126,34,206,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }),
  btnGhost: {
    padding: '13px 16px',
    borderRadius: '11px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    color: '#555',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  },
  btnSecondary: {
    flex: 1,
    padding: '13px 16px',
    borderRadius: '11px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#888',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
}

export default function SetupPage() {
  const navigate  = useNavigate()
  const { setApiKey, setActiveCerts, setPrimaryCert, groqModel } = useSettingsStore()
  const setFirstRun = useAppStore(s => s.setFirstRun)

  const [step, setStep]                   = useState(1)
  const [apiKey, setApiKeyLocal]          = useState('')
  const [showKey, setShowKey]             = useState(false)
  const [selectedCerts, setSelectedCerts] = useState<CertId[]>(['security-plus'])
  const [testing, setTesting]             = useState(false)
  const [testResult, setTestResult]       = useState<{ ok: boolean; message: string } | null>(null)

  const toggleCert = (certId: CertId) => {
    setSelectedCerts(prev =>
      prev.includes(certId) ? prev.filter(c => c !== certId) : [...prev, certId]
    )
  }

  const handleTestKey = async () => {
    if (!apiKey.trim() || testing) return
    setTesting(true)
    setTestResult(null)
    const result = await testGroqKey(apiKey.trim(), groqModel)
    setTestResult(result)
    setTesting(false)
  }

  const handleFinish = () => {
    if (selectedCerts.length === 0) return
    if (apiKey.trim()) setApiKey(apiKey.trim())
    setActiveCerts(selectedCerts)
    setPrimaryCert(selectedCerts[0])
    setFirstRun(false)
    navigate('/dashboard')
  }

  return (
    <div style={S.page}>
      {/* Ambient blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.container}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.logoRing}>
            <Shield size={30} color="#fff" />
          </div>
          <div>
            <h1 style={S.appName}>CyberCert Study</h1>
            <p style={S.appSub}>AI-powered cybersecurity certification prep</p>
          </div>
        </div>

        {/* ── Step indicators ── */}
        <div style={S.steps}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={S.stepDot(step === s, step > s)}>
                {step > s ? <Check size={13} /> : s}
              </div>
              {s < 3 && <div style={S.stepLine(step > s)} />}
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            STEP 1 — Welcome
        ══════════════════════════════════════════ */}
        {step === 1 && (
          <div style={S.card}>
            <div>
              <h2 style={S.cardTitle}>Welcome 👋</h2>
              <p style={S.cardSub}>
                CyberCert Study is fully client-side — all your data stays in your browser.
                AI features are powered by the Groq API (free tier available).
              </p>
            </div>

            <div style={S.featureRow}>
              {[
                {
                  icon: <Brain size={17} />,
                  color: '#c084fc',
                  bg: 'rgba(126,34,206,0.15)',
                  title: 'AI Study Suite',
                  desc: 'AI Tutor, spaced repetition flashcards, practice questions, timed exams, and lab simulations.',
                },
                {
                  icon: <Zap size={17} />,
                  color: '#fbbf24',
                  bg: 'rgba(161,98,7,0.15)',
                  title: 'Free Groq API Key Required',
                  desc: (
                    <>
                      Get your free key at{' '}
                      <a
                        href="https://console.groq.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#c084fc' }}
                      >
                        console.groq.com
                      </a>
                      {' '}— fast inference, generous free tier.
                    </>
                  ),
                },
                {
                  icon: <FlaskConical size={17} />,
                  color: '#4ade80',
                  bg: 'rgba(21,128,61,0.15)',
                  title: 'Everything Stays Local',
                  desc: 'IndexedDB stores all your progress, notes, and flashcards. Nothing is sent to any server.',
                },
              ].map(f => (
                <div key={f.title} style={S.featureItem}>
                  <div style={S.featureIcon(f.color, f.bg)}>{f.icon}</div>
                  <div>
                    <p style={S.featureTitle}>{f.title}</p>
                    <p style={S.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={S.btnPrimary(false)}
              onClick={() => setStep(2)}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(126,34,206,0.5)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(126,34,206,0.35)'
              }}
            >
              Get Started <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — API Key
        ══════════════════════════════════════════ */}
        {step === 2 && (
          <div style={S.card}>
            <div>
              <h2 style={S.cardTitle}>Add Your Groq API Key</h2>
              <p style={S.cardSub}>
                Stored locally in your browser only — never sent anywhere except Groq's servers.
              </p>
            </div>

            {/* Security notice */}
            <div style={S.warningBox}>
              <Key size={15} style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
              <ul style={S.warningList}>
                {[
                  'App runs entirely in your browser — key is in client-side storage',
                  'Use a scoped/restricted key if Groq supports it',
                  'Rotate your key regularly',
                  'Never share your screen while the key is visible',
                  'You can update or remove your key anytime in Settings',
                ].map(item => (
                  <li key={item} style={S.warningItem}>
                    <span style={{ color: '#b45309', flexShrink: 0 }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Input */}
            <div style={S.inputWrap}>
              <label style={S.label}>Groq API Key</label>
              <div style={S.inputRow}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKeyLocal(e.target.value); setTestResult(null) }}
                  placeholder="gsk_..."
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(147,51,234,0.6)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(126,34,206,0.12)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  style={S.input}
                />
                <button
                  onClick={() => setShowKey(s => !s)}
                  style={S.eyeBtn}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ccc')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Test button */}
            <button
              style={S.testBtn(!apiKey.trim(), testing)}
              onClick={handleTestKey}
              disabled={!apiKey.trim() || testing}
            >
              {testing ? 'Testing…' : 'Test Connection'}
            </button>

            {/* Result */}
            {testResult && (
              <div style={S.resultPill(testResult.ok)}>
                {testResult.ok
                  ? <Check size={14} />
                  : <span style={{ fontSize: 14 }}>✕</span>
                }
                {testResult.message}
              </div>
            )}

            {/* Actions */}
            <div style={S.btnRow}>
              <button style={S.btnGhost} onClick={() => setStep(1)}>Back</button>
              <button style={S.btnSecondary} onClick={() => setStep(3)}>Skip for now</button>
              <button
                style={S.btnPrimary(!apiKey.trim())}
                disabled={!apiKey.trim()}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — Choose Certs
        ══════════════════════════════════════════ */}
        {step === 3 && (
          <div style={S.card}>
            <div>
              <h2 style={S.cardTitle}>Choose Your Certifications</h2>
              <p style={S.cardSub}>
                Select what you're studying for. You can change this anytime in Settings.
              </p>
            </div>

            <div style={S.certGrid}>
              {CERTS_DATA.map(cert => {
                const selected = selectedCerts.includes(cert.id)
                return (
                  <CertCardButton
                    key={cert.id}
                    cert={cert}
                    selected={selected}
                    onToggle={() => toggleCert(cert.id)}
                  />
                )
              })}
            </div>

            {selectedCerts.length === 0 && (
              <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>
                Please select at least one certification.
              </p>
            )}

            <div style={S.btnRow}>
              <button style={S.btnGhost} onClick={() => setStep(2)}>Back</button>
              <button
                style={S.btnPrimary(selectedCerts.length === 0)}
                disabled={selectedCerts.length === 0}
                onClick={handleFinish}
                onMouseEnter={e => {
                  if (selectedCerts.length > 0) {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(126,34,206,0.5)'
                  }
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = selectedCerts.length > 0
                    ? '0 4px 20px rgba(126,34,206,0.35)'
                    : 'none'
                }}
              >
                Start Studying! <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Cert card with hover state ───────────────────────────────────────────────
function CertCardButton({
  cert,
  selected,
  onToggle,
}: {
  cert: typeof CERTS_DATA[number]
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
        ...S.certCard(selected),
        border: selected
          ? '1px solid rgba(147,51,234,0.5)'
          : hovered
          ? '1px solid rgba(255,255,255,0.14)'
          : '1px solid rgba(255,255,255,0.07)',
        background: selected
          ? 'rgba(126,34,206,0.1)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
      }}
    >
      {/* Selected check */}
      {selected && (
        <div style={S.certCheck}>
          <Check size={11} color="#fff" />
        </div>
      )}

      {/* Dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={S.certDot(cert.color)} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
          {cert.name}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ fontSize: '11px', color: '#444' }}>{cert.vendor}</span>
        <span style={{ fontSize: '11px', color: '#333' }}>{cert.domains.length} domains</span>
      </div>
    </button>
  )
}