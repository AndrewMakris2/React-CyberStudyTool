import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getAllProgressForCert, setObjectiveProgress } from '../db'
import { CERTS_DATA } from '../data/objectives'
import { useSettingsStore } from '../store/useSettingsStore'
import ObjectiveList from '../components/objectives/ObjectiveList'
import { Select } from '../components/ui/Select'
import type { ObjectiveProgress, ObjectiveStatus, CertId } from '../types'

export default function ObjectivesPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const setActiveCert = useAppStore(s => s.setActiveCert)
  const activeCertIds = useSettingsStore(s => s.activeCertIds)
  const showToast = useAppStore(s => s.showToast)
  const [progress, setProgress] = useState<ObjectiveProgress[]>([])
  const cert = CERTS_DATA.find(c => c.id === activeCertId)

  useEffect(() => {
    getAllProgressForCert(activeCertId).then(setProgress)
  }, [activeCertId])

  const handleStatusChange = async (objectiveId: string, certId: string, status: ObjectiveStatus) => {
    await setObjectiveProgress(objectiveId, certId, status)
    const updated = await getAllProgressForCert(activeCertId)
    setProgress(updated)
    if (status === 'mastered') showToast('Objective marked as mastered! 🎉', 'success')
  }

  const certOptions = CERTS_DATA
    .filter(c => activeCertIds.includes(c.id))
    .map(c => ({ value: c.id, label: c.name }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Objectives</h1>
          <p className="text-sm text-muted mt-2">
            Track your progress across all exam objectives. Click a status badge to cycle through states.
          </p>
        </div>
        <div style={{ width: '220px' }}>
          <Select
            value={activeCertId}
            onChange={e => setActiveCert(e.target.value as CertId)}
            options={certOptions}
          />
        </div>
      </div>

      {cert ? (
        <ObjectiveList
          cert={cert}
          progressItems={progress}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }} className="text-muted">
          <p>No certification selected. Go to Settings to add certifications.</p>
        </div>
      )}
    </div>
  )
}