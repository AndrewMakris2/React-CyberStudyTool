import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { groqChat } from '../llm/groqClient'
import { buildLabSystemPrompt, buildLabGenPrompt, buildLabGraderPrompt } from '../prompts/labPrompt'
import { saveLabAttempt, updateLabAttempt, getLabAttempts } from '../db'
import { CERTS_DATA } from '../data/objectives'
import type { Lab, LabType, LabAttempt, LabFeedback, Difficulty, CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import LabCard from '../components/labs/LabCard'
import LabRunner from '../components/labs/LabRunner'
import LabFeedbackComponent from '../components/labs/LabFeedback'

type PageMode = 'list' | 'running' | 'feedback'

const LAB_TYPES: { value: LabType; label: string }[] = [
  { value: 'log-analysis', label: 'Log Analysis' },
  { value: 'network-troubleshooting', label: 'Network Troubleshooting' },
  { value: 'incident-response', label: 'Incident Response' },
  { value: 'threat-modeling', label: 'Threat Modeling' },
  { value: 'vulnerability-triage', label: 'Vulnerability Triage' },
]

export default function LabsPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const resetLabHints = useAppStore(s => s.resetLabHints)
  const showToast = useAppStore(s => s.showToast)
  const groqApiKey = useSettingsStore(s => s.groqApiKey)

  const [pageMode, setPageMode] = useState<PageMode>('list')
  const [generatedLabs, setGeneratedLabs] = useState<Lab[]>([])
  const [currentLab, setCurrentLab] = useState<Lab | null>(null)
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<LabFeedback | null>(null)
  const [attempts, setAttempts] = useState<LabAttempt[]>([])
  const [generating, setGenerating] = useState(false)
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [labType, setLabType] = useState<LabType>('log-analysis')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [domainId, setDomainId] = useState('')

  const cert = CERTS_DATA.find(c => c.id === activeCertId)
  const domainOptions = [
    { value: '', label: 'Auto-select domain' },
    ...(cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []),
  ]

  useEffect(() => {
    getLabAttempts(activeCertId).then(setAttempts)
  }, [activeCertId])

  const handleGenerateLab = async () => {
    if (!groqApiKey) { setError('Add your Groq API key in Settings.'); return }
    setGenerating(true)
    setError(null)

    try {
      const selectedDomain = domainId
        ? cert?.domains.find(d => d.id === domainId)
        : cert?.domains[Math.floor(Math.random() * (cert?.domains.length ?? 1))]

      const domainName = selectedDomain?.name ?? 'General Security'

      const response = await groqChat({
        messages: [
          { role: 'system', content: buildLabSystemPrompt() },
          { role: 'user', content: buildLabGenPrompt(labType, difficulty, activeCertId as CertId, domainName) },
        ],
        maxTokens: 3500,
        temperature: 0.7,
      })

      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Invalid response format from AI')
      const parsed = JSON.parse(jsonMatch[0])

      const lab: Lab = {
        id: crypto.randomUUID(),
        type: labType,
        title: parsed.title ?? `${labType.replace(/-/g, ' ')} Lab`,
        certId: activeCertId as CertId,
        domainId: selectedDomain?.id ?? '',
        difficulty,
        estimatedMinutes: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
        prompt: parsed.prompt ?? '',
        scenario: parsed.scenario ?? '',
        hints: parsed.hints ?? [],
        rubric: parsed.rubric ?? { maxScore: 100, criteria: [] },
        modelAnswer: parsed.modelAnswer ?? '',
      }

      setGeneratedLabs(prev => [lab, ...prev])
      showToast('Lab generated! Click Start Lab to begin.', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lab')
    } finally {
      setGenerating(false)
    }
  }

  const handleStartLab = async (lab: Lab) => {
    resetLabHints()
    setCurrentLab(lab)
    setFeedback(null)

    const id = await saveLabAttempt({
      labId: lab.id,
      certId: activeCertId as CertId,
      userResponse: '',
      startedAt: new Date(),
    })
    setCurrentAttemptId(Number(id))
    setPageMode('running')
  }

  const handleSubmitLab = async (response: string) => {
    if (!currentLab) return
    setGrading(true)
    setError(null)

    try {
      const rubricStr = JSON.stringify(currentLab.rubric, null, 2)
      const gradeResponse = await groqChat({
        messages: [
          { role: 'system', content: buildLabSystemPrompt() },
          {
            role: 'user',
            content: buildLabGraderPrompt(
              currentLab.title,
              currentLab.scenario,
              currentLab.prompt,
              response,
              rubricStr,
              currentLab.modelAnswer ?? ''
            ),
          },
        ],
        maxTokens: 2000,
        temperature: 0.3,
      })

      const jsonMatch = gradeResponse.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Invalid grading response')
      const gradeParsed: LabFeedback = JSON.parse(jsonMatch[0])

      setFeedback(gradeParsed)

      if (currentAttemptId) {
        await updateLabAttempt(currentAttemptId, {
          userResponse: response,
          feedback: gradeParsed,
          score: gradeParsed.overallScore,
          completedAt: new Date(),
        })
      }

      const updated = await getLabAttempts(activeCertId)
      setAttempts(updated)
      setPageMode('feedback')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade lab')
    } finally {
      setGrading(false)
    }
  }

  const handleRetry = () => {
    if (!currentLab) return
    resetLabHints()
    setFeedback(null)
    setPageMode('running')
  }

  const handleDone = () => {
    setCurrentLab(null)
    setFeedback(null)
    setCurrentAttemptId(null)
    resetLabHints()
    setPageMode('list')
  }

  // ── Running mode ──────────────────────────────────────────────────────────
  if (pageMode === 'running' && currentLab) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleDone}>
            ← Back to Labs
          </Button>
        </div>
        {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}
        <LabRunner
          lab={currentLab}
          onSubmit={handleSubmitLab}
          loading={grading}
        />
      </div>
    )
  }

  // ── Feedback mode ─────────────────────────────────────────────────────────
  if (pageMode === 'feedback' && currentLab && feedback) {
    return (
      <div className="max-w-3xl mx-auto">
        <LabFeedbackComponent
          feedback={feedback}
          labTitle={currentLab.title}
          onRetry={handleRetry}
          onDone={handleDone}
        />
      </div>
    )
  }

  // ── List mode ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Lab Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Text-based, guided labs simulating real security workflows. Graded with AI feedback.
        </p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

      {/* Generator */}
      <Card variant="elevated" className="flex flex-col gap-4">
        <h2 className="font-semibold text-white">Generate a Lab</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Lab Type"
            value={labType}
            onChange={e => setLabType(e.target.value as LabType)}
            options={LAB_TYPES}
          />
          <Select
            label="Difficulty"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
          <Select
            label="Domain"
            value={domainId}
            onChange={e => setDomainId(e.target.value)}
            options={domainOptions}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleGenerateLab}
          loading={generating}
          disabled={!groqApiKey}
          className="self-start"
        >
          Generate Lab
        </Button>
        {!groqApiKey && (
          <Alert variant="warning">Add your Groq API key in Settings to generate labs.</Alert>
        )}
      </Card>

      {/* Generated labs */}
      {generatedLabs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Generated Labs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedLabs.map(lab => {
              const labAttempts = attempts.filter(a => a.labId === lab.id)
              const lastAttempt = labAttempts.sort(
                (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
              )[0]
              return (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  onStart={handleStartLab}
                  completed={!!lastAttempt?.completedAt}
                  lastScore={lastAttempt?.score !== undefined
                    ? Math.round((lastAttempt.score / lab.rubric.maxScore) * 100)
                    : undefined
                  }
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Recent attempts */}
      {attempts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Recent Attempts</h2>
          <div className="flex flex-col gap-3">
            {[...attempts]
              .filter(a => a.completedAt)
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .slice(0, 5)
              .map(attempt => (
                <div key={attempt.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{attempt.labId.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {attempt.score !== undefined && (
                    <div className={`text-lg font-bold ${
                      attempt.score >= 70 ? 'text-green-400' :
                      attempt.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {attempt.score}pts
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {generatedLabs.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🧪</div>
          <p className="font-medium">No labs yet</p>
          <p className="text-sm mt-1">Generate a lab above to get started</p>
        </div>
      )}
    </div>
  )
}