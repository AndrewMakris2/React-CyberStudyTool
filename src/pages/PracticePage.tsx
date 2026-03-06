import { useState, useEffect } from 'react'
import { Dumbbell, RefreshCw, Save } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { groqChat } from '../llm/groqClient'
import { buildQuestionGenSystemPrompt, buildQuestionGenUserPrompt } from '../prompts/questionGen'
import { savePracticeQuestions, getPracticeQuestions, deletePracticeQuestion } from '../db'
import { CERTS_DATA } from '../data/objectives'
import type { PracticeQuestion, QuestionType, Difficulty, CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import QuestionCard from '../components/practice/QuestionCard'

export default function PracticePage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast = useAppStore(s => s.showToast)
  const groqApiKey = useSettingsStore(s => s.groqApiKey)

  const [domainId, setDomainId] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed')
  const [count, setCount] = useState(10)
  const [types, setTypes] = useState<QuestionType[]>(['multiple-choice', 'scenario'])
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState<'config' | 'practice' | 'done'>('config')

  const cert = CERTS_DATA.find(c => c.id === activeCertId)
  const domainOptions = [
    { value: '', label: 'All Domains' },
    ...(cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []),
  ]

  const typeOptions: { value: QuestionType; label: string }[] = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'multiple-response', label: 'Multiple Response' },
    { value: 'scenario', label: 'Scenario-Based' },
    { value: 'pbq', label: 'Performance-Based (PBQ)' },
  ]

  const toggleType = (t: QuestionType) => {
    setTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
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
          { role: 'user', content: buildQuestionGenUserPrompt(activeCertId as CertId, domains, difficulty, count, types) },
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

  const handleSaveQuestions = async () => {
    if (questions.length === 0) return
    await savePracticeQuestions(questions)
    setSaved(true)
    showToast(`${questions.length} questions saved to your bank!`, 'success')
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setMode('done')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Practice Questions</h1>
        <p className="text-gray-400 text-sm mt-1">
          Generate AI-powered practice questions tailored to your cert and domains.
        </p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

      {mode === 'config' && (
        <Card variant="elevated" className="flex flex-col gap-5">
          <h2 className="font-semibold text-white">Configure Question Set</h2>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Domain"
              value={domainId}
              onChange={e => setDomainId(e.target.value)}
              options={domainOptions}
            />
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as Difficulty | 'mixed')}
              options={[
                { value: 'mixed', label: 'Mixed' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />
          </div>

          <Select
            label="Number of Questions"
            value={String(count)}
            onChange={e => setCount(Number(e.target.value))}
            options={[5, 10, 15, 20, 25].map(n => ({ value: String(n), label: `${n} questions` }))}
          />

          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Question Types</p>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(t => (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    types.includes(t.value)
                      ? 'border-cyan-600 bg-cyan-900/20 text-cyan-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            loading={generating}
            disabled={!groqApiKey || types.length === 0}
            leftIcon={<Dumbbell size={16} />}
          >
            Generate {count} Questions
          </Button>

          {!groqApiKey && (
            <Alert variant="warning">Add your Groq API key in Settings to generate questions.</Alert>
          )}
        </Card>
      )}

      {mode === 'practice' && questions.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="info">{currentIndex + 1} / {questions.length}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setMode('config')} leftIcon={<RefreshCw size={14} />}>
                New Set
              </Button>
            </div>
            {!saved && (
              <Button variant="outline" size="sm" onClick={handleSaveQuestions} leftIcon={<Save size={14} />}>
                Save to Bank
              </Button>
            )}
          </div>

          <QuestionCard
            question={questions[currentIndex]}
            index={currentIndex}
            total={questions.length}
            onNext={handleNext}
          />
        </div>
      )}

      {mode === 'done' && (
        <Card variant="elevated" className="text-center py-10">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-white mb-2">Practice Set Complete!</h2>
          <p className="text-gray-400 text-sm mb-6">
            You finished all {questions.length} questions.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setCurrentIndex(0); setMode('practice') }}>
              Review Again
            </Button>
            <Button variant="primary" onClick={() => { setMode('config'); setQuestions([]) }} leftIcon={<RefreshCw size={14} />}>
              Generate New Set
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}