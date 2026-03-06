import { useAppStore } from '../store/useAppStore'
import { CERTS_DATA } from '../data/objectives'
import ChatWindow from '../components/chat/ChatWindow'
import type { CertId } from '../types'

export default function TutorPage() {
  const activeCertId   = useAppStore(s => s.activeCertId)
  const activeDomainId = useAppStore(s => s.activeDomainId)
  const setActiveCert  = useAppStore(s => s.setActiveCert)
  const setActiveDomain = useAppStore(s => s.setActiveDomain)

  const cert = CERTS_DATA.find(c => c.id === activeCertId)

  const certOptions = CERTS_DATA.map(c => ({ value: c.id, label: c.name }))
  const domainOptions = [
    { value: '', label: 'All Domains' },
    ...(cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []),
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      maxWidth: '900px',
      margin: '0 auto',
      gap: '20px',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            AI Tutor
          </h1>
          <p style={{ fontSize: '13px', color: '#4a4a4a', marginTop: '5px' }}>
            Ask questions, get explanations, and prepare for your exam.
          </p>
        </div>

        {/* Selects */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <StyledSelect
            value={activeCertId}
            onChange={e => setActiveCert(e.target.value as CertId)}
            options={certOptions}
          />
          <StyledSelect
            value={activeDomainId ?? ''}
            onChange={e => setActiveDomain(e.target.value || null)}
            options={domainOptions}
          />
        </div>
      </div>

      {/* ── Chat fills remaining height ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatWindow />
      </div>
    </div>
  )
}

function StyledSelect({
  value, onChange, options,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '8px 32px 8px 12px',
        fontSize: '13px',
        color: '#ccc',
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        minWidth: '160px',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#1a1a1a' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}