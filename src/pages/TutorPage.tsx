import { useAppStore } from '../store/useAppStore'
import { CERTS_DATA } from '../data/objectives'
import ChatWindow from '../components/chat/ChatWindow'
import { Select } from '../components/ui/Select'
import type { CertId } from '../types'

export default function TutorPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const activeDomainId = useAppStore(s => s.activeDomainId)
  const setActiveCert = useAppStore(s => s.setActiveCert)
  const setActiveDomain = useAppStore(s => s.setActiveDomain)

  const cert = CERTS_DATA.find(c => c.id === activeCertId)

  const certOptions = CERTS_DATA.map(c => ({ value: c.id, label: c.name }))
  const domainOptions = [
    { value: '', label: 'All Domains' },
    ...(cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []),
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Tutor</h1>
          <p className="text-gray-400 text-sm mt-1">
            Ask questions, get explanations, and prepare for your exam.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-48">
            <Select
              value={activeCertId}
              onChange={e => setActiveCert(e.target.value as CertId)}
              options={certOptions}
            />
          </div>
          <div className="w-48">
            <Select
              value={activeDomainId ?? ''}
              onChange={e => setActiveDomain(e.target.value || null)}
              options={domainOptions}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  )
}