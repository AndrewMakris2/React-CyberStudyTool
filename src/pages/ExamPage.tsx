import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useTimer } from '../hooks/useTimer'
import { groqChat } from '../llm/groqClient'
import { buildQuestionGenSystemPrompt, buildQuestionGenUserPrompt } from '../prompts/questionGen'
import { saveExamAttempt, updateExamAttempt, getExamAttempts } from '../db'
import { CERTS_DATA } from '../data/objectives'
import type { ExamAttempt, ExamConfig, ExamScore, PracticeQuestion, CertId, Difficulty } from '../types'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import ExamTimer from '../components/exam/ExamTimer'
import ExamQuestion from '../components/exam/ExamQuestion'
import ScoreReport from '../components/exam/ScoreReport'
import AttemptHistory from '../components/exam/AttemptHistory'
import { Tabs, TabList, TabTrigger, TabContent } from '../components/ui/Tabs'

type ExamMode = 'config' | 'loading' | 'active' | 'review' | 'report'

export default function ExamPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast = useAppStore(s => s.showToast)
  const groqApiKey = useSettingsStore(s => s.groqApiKey)

  const [examMode, setExamMode] = useState<ExamMode>('config')
  const [config, setConfig] = useState<ExamConfig>({
    certId: activeCertId as CertId,
    domainIds: [],
    questionCount: 15,
    timeLimitMinutes: 30,
    difficulty: 'mixed',
  })
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [flagged, setFlagged] = useState<number[]>([])
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [score, setScore] = useState<ExamScore | null>(null)
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [error, setError] = useState<string | null>(null)

  const cert = CERTS_DATA.find(c => c.id === activeCertId)

  const { seconds, start: startTimer, pause: pauseTimer, reset: resetTimer } = useTimer({
    initialSeconds: config.timeLimitMinutes * 60,
    countDown: true,
    onExpire: () => handleFinishExam(true),
  })

  useEffect(() => {
    getExamAttempts(activeCertId).then(setAttempts)
  }, [activeCertId])

  const handleStartExam = async () => {
    if (!groqApiKey) { setError('Add your Groq API key in Settings.'); return }
    setExamMode('loading')
    setError(null)

    try {
      const domains = config.domainIds.length > 0
        ? cert?.domains.filter(d => config.domainIds.includes(d.id)).map(d => d.name) ?? []
        : cert?.domains.map(d => d.name) ?? []

      const response = await groqChat({
        messages: [
          { role: 'system', content: buildQuestionGenSystemPrompt() },
          { role: 'user', content: buildQuestionGenUserPrompt(
            activeCertId as CertId,
            domains,
            config.difficulty,
            config.questionCount,
            ['multiple-choice', 'multiple-response', 'scenario']
          )},
        ],
        maxTokens: 5000,
        temperature: 0.7,
      })

      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Invalid response format')
      const parsed: any[] = JSON.parse(jsonMatch[0])

      const now = new Date()
      const qs: PracticeQuestion[] = parsed.map(q => ({
        certId: activeCertId as CertId,
        domainId: q.domainName
          ? cert?.domains.find(d => d.name.toLowerCase().includes(q.domainName?.toLowerCase().split(' ')[0]))?.id ?? cert?.domains[0]?.id ?? ''
          : cert?.domains[0]?.id ?? '',
        objectiveIds: [],
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
      setAnswers({})
      setFlagged([])

      const id = await saveExamAttempt({
        certId: activeCertId as CertId,
        config,
        questions: qs,
        answers: {},
        flagged: [],
        startedAt: now,
      })
      setAttemptId(Number(id))
      resetTimer(config.timeLimitMinutes * 60)
      startTimer()
      setExamMode('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate exam')
      setExamMode('config')
    }
  }

  const handleFinishExam = useCallback(async (timeExpired = false) => {
    pauseTimer()
    if (timeExpired) showToast('Time is up! Calculating your score...', 'warning')

    const timeTaken = config.timeLimitMinutes * 60 - seconds

    const domainMap: Record<string, { correct: number; total: number; name: string }> = {}
    questions.forEach((q, i) => {
      const selected = answers[i] ?? []
      const isCorrect = q.correctAnswers.every(a => selected.includes(a)) && selected.every(a => q.correctAnswers.includes(a))
      if (!domainMap[q.domainId]) {
        const d = cert?.domains.find(dom => dom.id === q.domainId)
        domainMap[q.domainId] = { correct: 0, total: 0, name: d?.name ?? q.domainId }
      }
      domainMap[q.domainId].total++
      if (isCorrect) domainMap[q.domainId].correct++
    })

    let totalCorrect = 0
    questions.forEach((q, i) => {
      const selected = answers[i] ?? []
      const isCorrect = q.correctAnswers.every(a => selected.includes(a)) && selected.every(a => q.correctAnswers.includes(a))
      if (isCorrect) totalCorrect++
    })

    const weaknesses = Object.entries(domainMap)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.7)
      .map(([id]) => id)

    const examScore: ExamScore = {
      totalQuestions: questions.length,
      correctCount: totalCorrect,
      percentage: (totalCorrect / questions.length) * 100,
      domainBreakdown: Object.entries(domainMap).map(([id, v]) => ({
        domainId: id,
        domainName: v.name,
        correct: v.correct,
        total: v.total,
        percentage: v.total > 0 ? (v.correct / v.total) * 100 : 0,
      })),
      objectiveWeaknesses: weaknesses,
      timeTakenSeconds: timeTaken,
    }

    setScore(examScore)

    if (attemptId) {
      await updateExamAttempt(attemptId, {
        answers,
        flagged,
        completedAt: new Date(),
        score: examScore,
      })
    }

    const updated = await getExamAttempts(activeCertId)
    setAttempts(updated)
    setExamMode('report')
  }, [questions, answers, flagged, seconds, config, attemptId, activeCertId, cert, pauseTimer, showToast])

  if (examMode === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-gray-400">Generating your exam questions...</p>
      </div>
    )
  }

  if (examMode === 'active' && questions.length > 0) {
    const q = questions[currentIndex]
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto">
        {/* Exam header */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-gray-800 mb-6 flex-shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{currentIndex + 1} / {questions.length}</span>
            {flagged.length > 0 && (
              <Badge variant="warning" size="sm">{flagged.length} flagged</Badge>
            )}
          </div>
          <ExamTimer seconds={seconds} totalSeconds={config.timeLimitMinutes * 60} />
          <Button variant="danger" size="sm" onClick={() => handleFinishExam(false)}>
            Finish Exam
          </Button>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto">
          <ExamQuestion
            question={q}
            index={currentIndex}
            total={questions.length}
            flagged={flagged.includes(currentIndex)}
            onToggleFlag={() => setFlagged(prev =>
              prev.includes(currentIndex)
                ? prev.filter(i => i !== currentIndex)
                : [...prev, currentIndex]
            )}
            selectedAnswers={answers[currentIndex] ?? []}
            onAnswerSelect={ids => setAnswers(prev => ({ ...prev, [currentIndex]: ids }))}
          />
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-4 flex-shrink-0">
          <Button
            variant="secondary"
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>

          {/* Question picker */}
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                  i === currentIndex ? 'bg-cyan-600 text-white' :
                  flagged.includes(i) ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600' :
                  answers[i]?.length ? 'bg-gray-700 text-gray-300' :
                  'bg-gray-800 text-gray-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex(i => i + 1)
              } else {
                handleFinishExam(false)
              }
            }}
          >
            {currentIndex < questions.length - 1 ? 'Next →' : 'Finish'}
          </Button>
        </div>
      </div>
    )
  }

  if (examMode === 'report' && score) {
    return (
      <div className="max-w-4xl mx-auto">
        <ScoreReport
          score={score}
          questions={questions}
          answers={answers}
          onRetry={() => { setExamMode('config'); setQuestions([]); setScore(null) }}
          onReview={() => setExamMode('review')}
          onDone={() => setExamMode('config')}
        />
      </div>
    )
  }

  if (examMode === 'review' && questions.length > 0) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Answer Review</h1>
          <Button variant="secondary" onClick={() => setExamMode('report')}>Back to Report</Button>
        </div>
        {questions.map((q, i) => (
          <div key={i} className="flex flex-col gap-2">
            <QuestionCard
              question={q}
              index={i}
              total={questions.length}
              examMode={false}
              selectedAnswers={answers[i] ?? []}
              showResult={true}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Exam Mode</h1>
        <p className="text-gray-400 text-sm mt-1">
          Timed, full-length practice exams with score reports and domain analysis.
        </p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

      <Tabs defaultTab="new">
        <TabList>
          <TabTrigger value="new">New Exam</TabTrigger>
          <TabTrigger value="history">History ({attempts.filter(a => a.score).length})</TabTrigger>
        </TabList>

        <TabContent value="new">
          <Card variant="elevated" className="flex flex-col gap-5">
            <h2 className="font-semibold text-white">Configure Exam</h2>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Number of Questions"
                value={String(config.questionCount)}
                onChange={e => setConfig(c => ({ ...c, questionCount: Number(e.target.value) }))}
                options={[10, 15, 20, 25, 30, 40, 50, 75, 90].map(n => ({ value: String(n), label: `${n} questions` }))}
              />
              <Select
                label="Time Limit"
                value={String(config.timeLimitMinutes)}
                onChange={e => setConfig(c => ({ ...c, timeLimitMinutes: Number(e.target.value) }))}
                options={[15, 30, 45, 60, 90, 120].map(n => ({ value: String(n), label: `${n} minutes` }))}
              />
            </div>

            <Select
              label="Difficulty"
              value={config.difficulty}
              onChange={e => setConfig(c => ({ ...c, difficulty: e.target.value as Difficulty | 'mixed' }))}
              options={[
                { value: 'mixed', label: 'Mixed (Recommended)' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />

            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">Domains (leave empty for all)</p>
              <div className="flex flex-wrap gap-2">
                {cert?.domains.map(domain => (
                  <button
                    key={domain.id}
                    onClick={() => setConfig(c => ({
                      ...c,
                      domainIds: c.domainIds.includes(domain.id)
                        ? c.domainIds.filter(id => id !== domain.id)
                        : [...c.domainIds, domain.id],
                    }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      config.domainIds.includes(domain.id)
                        ? 'border-cyan-600 bg-cyan-900/20 text-cyan-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {domain.name}
                  </button>
                ))}
              </div>
            </div>

            <Alert variant="info">
              This exam will be timed. Once started, the timer cannot be paused.
              Answer all questions and click Finish to see your results.
            </Alert>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStartExam}
              disabled={!groqApiKey}
              className="w-full"
            >
              Start Exam
            </Button>

            {!groqApiKey && (
              <Alert variant="warning">Add your Groq API key in Settings to start an exam.</Alert>
            )}
          </Card>
        </TabContent>

        <TabContent value="history">
          <AttemptHistory attempts={attempts} />
        </TabContent>
      </Tabs>
    </div>
  )
}

// Need QuestionCard import for review mode
import QuestionCard from '../components/practice/QuestionCard'