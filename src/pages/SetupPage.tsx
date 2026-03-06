import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Key, BookOpen, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useAppStore } from '../store/useAppStore'
import { CERTS_DATA } from '../data/objectives'
import { testGroqKey } from '../llm/groqClient'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { cn } from '../utils/cn'
import type { CertId } from '../types'

export default function SetupPage() {
  const navigate = useNavigate()
  const { setApiKey, setActiveCerts, setPrimaryCert, groqModel } = useSettingsStore()
  const setFirstRun = useAppStore(s => s.setFirstRun)

  const [step, setStep] = useState(1)
  const [apiKey, setApiKeyLocal] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [selectedCerts, setSelectedCerts] = useState<CertId[]>(['security-plus'])
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  const toggleCert = (certId: CertId) => {
    setSelectedCerts(prev =>
      prev.includes(certId)
        ? prev.filter(c => c !== certId)
        : [...prev, certId]
    )
  }

  const handleTestKey = async () => {
    if (!apiKey.trim()) return
    setTesting(true)
    setTestResult(null)
    const result = await testGroqKey(apiKey.trim(), groqModel)
    setTestResult(result)
    setTesting(false)
  }

  const handleFinish = () => {
    if (!apiKey.trim() || selectedCerts.length === 0) return
    setApiKey(apiKey.trim())
    setActiveCerts(selectedCerts)
    setPrimaryCert(selectedCerts[0])
    setFirstRun(false)
    navigate('/dashboard')
  }

  const handleSkipKey = () => {
    setActiveCerts(selectedCerts)
    setPrimaryCert(selectedCerts[0])
    setFirstRun(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-600 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CyberCert Study</h1>
          <p className="text-gray-400 mt-2">AI-powered cybersecurity certification prep</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                step >= s
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              )}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && <div className={cn('w-12 h-0.5', step > s ? 'bg-cyan-600' : 'bg-gray-700')} />}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                CyberCert Study is a fully client-side app. All your data stays in your browser.
                The AI features use the Groq API — you'll need a free API key.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-gray-900 rounded-xl p-4">
                <BookOpen size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Study Tools Included</p>
                  <p className="text-xs text-gray-400 mt-1">
                    AI Tutor, Flashcards with spaced repetition, Practice questions, Timed exams, Lab simulations, Knowledge base
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-900 rounded-xl p-4">
                <Key size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Free Groq API Key Required</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Get a free key at{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline">
                      console.groq.com
                    </a>
                    {' '}— fast, free tier available.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={() => setStep(2)} className="w-full">
              Get Started
            </Button>
          </div>
        )}

        {/* Step 2: API Key */}
        {step === 2 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Add Your Groq API Key</h2>
              <p className="text-gray-400 text-sm">
                Your key is stored locally in your browser and never sent to any server other than Groq.
              </p>
            </div>

            <Alert variant="warning" title="Security Notice">
              <ul className="text-xs space-y-1 mt-1">
                <li>• This app runs entirely in your browser — your key is in client-side storage</li>
                <li>• Use a scoped/restricted key if Groq supports it</li>
                <li>• Rotate your key regularly</li>
                <li>• Never share your screen while the key is visible</li>
                <li>• You can update or remove your key anytime in Settings</li>
              </ul>
            </Alert>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  label="Groq API Key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => {
                    setApiKeyLocal(e.target.value)
                    setTestResult(null)
                  }}
                  placeholder="gsk_..."
                  rightIcon={
                    <button onClick={() => setShowKey(s => !s)} className="hover:text-white transition-colors">
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
              </div>

              <Button
                variant="outline"
                onClick={handleTestKey}
                loading={testing}
                disabled={!apiKey.trim()}
              >
                Test Key
              </Button>

              {testResult && (
                <Alert variant={testResult.ok ? 'success' : 'danger'}>
                  {testResult.message}
                </Alert>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button
                variant="secondary"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!apiKey.trim()}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Certs */}
        {step === 3 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Choose Your Certifications</h2>
              <p className="text-gray-400 text-sm">
                Select the certifications you're studying for. You can change this later in Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CERTS_DATA.map(cert => {
                const selected = selectedCerts.includes(cert.id)
                return (
                  <button
                    key={cert.id}
                    onClick={() => toggleCert(cert.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                      selected
                        ? 'border-cyan-600 bg-cyan-900/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-900'
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: cert.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{cert.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cert.vendor}</p>
                      <p className="text-xs text-gray-500 mt-1">{cert.domains.length} domains</p>
                    </div>
                    {selected && (
                      <CheckCircle size={16} className="text-cyan-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {selectedCerts.length === 0 && (
              <Alert variant="warning">Please select at least one certification.</Alert>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinish}
                disabled={selectedCerts.length === 0}
                className="flex-1"
              >
                Start Studying!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}