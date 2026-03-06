import { useState } from 'react'
import { Eye, EyeOff, Save, RotateCcw, Download, Upload, TestTube, Shield } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useAppStore } from '../store/useAppStore'
import { testGroqKey } from '../llm/groqClient'
import { exportUserData, importUserData } from '../utils/exportImport'
import { CERTS_DATA } from '../data/objectives'
import type { CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Toggle } from '../components/ui/Toggle'
import { Alert } from '../components/ui/Alert'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Recommended)' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Faster)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B 32K' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
]

export default function SettingsPage() {
  const {
    groqApiKey, groqModel, activeCertIds, streamingEnabled,
    setApiKey, setModel, setActiveCerts, setStreaming,
  } = useSettingsStore()
  const showToast = useAppStore(s => s.showToast)

  const [apiKeyInput, setApiKeyInput] = useState(groqApiKey)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleSaveKey = () => {
    setApiKey(apiKeyInput.trim())
    setTestResult(null)
    showToast('API key saved', 'success')
  }
  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) return
    setTesting(true)
    setTestResult(null)
    const result = await testGroqKey(apiKeyInput.trim(), groqModel)
    setTestResult(result)
    setTesting(false)
  }
  const handleClearKey = () => {
    setApiKeyInput('')
    setApiKey('')
    setTestResult(null)
    showToast('API key cleared', 'info')
  }
  const toggleCert = (certId: CertId) => {
    if (activeCertIds.includes(certId)) {
      if (activeCertIds.length <= 1) return
      setActiveCerts(activeCertIds.filter(c => c !== certId))
    } else {
      setActiveCerts([...activeCertIds, certId])
    }
  }
  const handleExport = async () => {
    try {
      await exportUserData()
      showToast('Data exported successfully!', 'success')
    } catch {
      showToast('Export failed', 'error')
    }
  }
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    try {
      await importUserData(file)
      showToast('Data imported successfully! Refresh to see changes.', 'success')
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '780px', margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted mt-2">
          Configure your API key, model, certifications, and data preferences.
        </p>
      </div>

      {/* Security Warning */}
      <Alert variant="warning" title="Security Notice">
        <ul style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
          <li>• Your API key is stored in browser localStorage — it is accessible to JavaScript on this page</li>
          <li>• Only use this app on trusted devices and networks</li>
          <li>• Rotate your Groq API key regularly at console.groq.com</li>
          <li>• Use the most restrictive key permissions available</li>
          <li>• Never share your screen while your API key is visible</li>
          <li>• Consider revoking and regenerating your key if you suspect compromise</li>
        </ul>
      </Alert>

      {/* API Key */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} style={{ color: '#22d3ee' }} />
              Groq API Key
            </span>
          </CardTitle>
          {groqApiKey && <Badge variant="success">Configured</Badge>}
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={e => { setApiKeyInput(e.target.value); setTestResult(null) }}
            placeholder="gsk_..."
            label="API Key"
            rightIcon={
              <button
                onClick={() => setShowKey(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <p style={{ fontSize: '12px', color: '#4a4a4a' }}>
            Get a free API key at{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-purple">
              console.groq.com
            </a>
          </p>
          {testResult && (
            <Alert variant={testResult.ok ? 'success' : 'danger'}>{testResult.message}</Alert>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={handleTestKey} loading={testing}
              disabled={!apiKeyInput.trim()} leftIcon={<TestTube size={14} />}>
              Test Key
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveKey}
              disabled={!apiKeyInput.trim()} leftIcon={<Save size={14} />}>
              Save Key
            </Button>
            {groqApiKey && (
              <Button variant="danger" size="sm" onClick={handleClearKey} leftIcon={<RotateCcw size={14} />}>
                Clear Key
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Model Selection */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>AI Model</CardTitle>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Groq Model"
            value={groqModel}
            onChange={e => setModel(e.target.value)}
            options={GROQ_MODELS}
          />
          <p style={{ fontSize: '12px', color: '#4a4a4a' }}>
            Llama 3.3 70B is recommended for best quality answers. Use 8B Instant for faster (but shorter) responses.
          </p>
          <Toggle
            checked={streamingEnabled}
            onChange={setStreaming}
            label="Enable Streaming"
            description="Stream AI responses token by token for a more responsive feel"
          />
        </div>
      </Card>

      {/* Certifications */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Active Certifications</CardTitle>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: '#777' }}>
            Select the certifications you're studying for. At least one must remain active.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {CERTS_DATA.map(cert => {
              const active = activeCertIds.includes(cert.id)
              return (
                <button
                  key={cert.id}
                  onClick={() => toggleCert(cert.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1px solid ${active ? 'rgba(147,51,234,0.5)' : '#242424'}`,
                    background: active ? 'rgba(126,34,206,0.12)' : '#171717',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <div style={{
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    backgroundColor: cert.color,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cert.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      {cert.domains.length} domains
                    </p>
                  </div>
                  {active && <Badge variant="purple" size="sm">Active</Badge>}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#777' }}>
            Export all your data (flashcards, notes, progress, exam history) as a JSON backup.
            Import a previously exported backup to restore your data.
          </p>
          {importError && (
            <Alert variant="danger" onClose={() => setImportError(null)}>{importError}</Alert>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="secondary" onClick={handleExport} leftIcon={<Download size={14} />}>
              Export All Data
            </Button>
            {/* Hidden file input styled as button */}
            <label style={{ display: 'inline-flex' }}>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
                disabled={importing}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '9px',
                  background: '#232323',
                  border: '1px solid #2e2e2e',
                  color: '#ddd',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: importing ? 'not-allowed' : 'pointer',
                  opacity: importing ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <Upload size={14} />
                {importing ? 'Importing…' : 'Import Backup'}
              </span>
            </label>
          </div>
          <Alert variant="warning">
            Importing data will merge with your existing data. Duplicate IDs will be overwritten.
            Export first before importing to avoid data loss.
          </Alert>
        </div>
      </Card>

      {/* About */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#666' }}>
          <p style={{ color: '#999', fontWeight: 500 }}>CyberCert Study v1.0.0</p>
          <p>All data is stored locally in your browser using IndexedDB (Dexie.js).</p>
          <p>AI features powered by Groq API. No data is stored on any server.</p>
          <p>Certifications supported: CompTIA Security+, Network+, CySA+, PenTest+.</p>
          <p style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '8px' }}>
            This app is for educational purposes only. Content is aligned to certification
            exam objectives and does not provide instructions for illegal activities.
          </p>
        </div>
      </Card>
    </div>
  )
}