import { useEffect, useState } from 'react'
import { Target, Layers, Trophy, Clock } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import {
  getAllProgressForCert, getDueCount, getExamAttempts,
  getStudySessions, getFlashcardsByDeck, getDecks,
} from '../db'
import { CERTS_DATA } from '../data/objectives'
import { calculateStreak } from '../utils/spacedRepetition'
import StatsCard from '../components/dashboard/StatsCard'
import ObjectiveMasteryChart from '../components/dashboard/ObjectiveMasteryChart'
import AccuracyTrendChart from '../components/dashboard/AccuracyTrendChart'
import FlashcardDueWidget from '../components/dashboard/FlashcardDueWidget'
import QuickActions from '../components/dashboard/QuickActions'
import TimeSpentWidget from '../components/dashboard/TimeSpentWidget'
import type { ObjectiveProgress, ExamAttempt, StudySession } from '../types'

export default function DashboardPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const [progress, setProgress] = useState<ObjectiveProgress[]>([])
  const [dueCount, setDueCount] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [prog, due, attempts, sess, decks] = await Promise.all([
        getAllProgressForCert(activeCertId),
        getDueCount(activeCertId),
        getExamAttempts(activeCertId),
        getStudySessions(),
        getDecks(activeCertId),
      ])
      setProgress(prog)
      setDueCount(due)
      setExamAttempts(attempts)
      setSessions(sess)
      let total = 0
      for (const deck of decks) {
        if (deck.id) {
          const cards = await getFlashcardsByDeck(deck.id)
          total += cards.length
        }
      }
      setTotalCards(total)
      setStreak(calculateStreak(sess.map(s => new Date(s.date))))
    }
    load()
  }, [activeCertId])

  const cert = CERTS_DATA.find(c => c.id === activeCertId)
  const allObjectives = cert?.domains.flatMap(d => d.objectives) ?? []
  const mastered = progress.filter(p => p.status === 'mastered').length
  const completedExams = examAttempts.filter(a => a.score)
  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((sum, a) => sum + (a.score?.percentage ?? 0), 0) / completedExams.length)
    : 0
  const todaySession = sessions.find(s => {
    const d = new Date(s.date)
    return d.toDateString() === new Date().toDateString()
  })
  const todayMinutes = Math.round((todaySession?.durationSeconds ?? 0) / 60)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-muted mt-2">
          {cert?.name} — Welcome back, keep studying!
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-4">
        <StatsCard
          title="Objectives Mastered"
          value={`${mastered}/${allObjectives.length}`}
          subtitle={`${allObjectives.length > 0 ? Math.round((mastered / allObjectives.length) * 100) : 0}% complete`}
          icon={Target}
          color="cyan"
        />
        <StatsCard
          title="Cards Due Today"
          value={dueCount}
          subtitle={`${totalCards} total cards`}
          icon={Layers}
          color="purple"
        />
        <StatsCard
          title="Avg Exam Score"
          value={completedExams.length > 0 ? `${avgScore}%` : '--'}
          subtitle={`${completedExams.length} exams taken`}
          icon={Trophy}
          color={avgScore >= 75 ? 'green' : avgScore > 0 ? 'yellow' : 'cyan'}
        />
        <StatsCard
          title="Today's Study Time"
          value={`${todayMinutes}m`}
          subtitle={streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak!'}
          icon={Clock}
          color="green"
        />
      </div>

      <QuickActions />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ObjectiveMasteryChart certId={activeCertId} progressItems={progress} />
          <AccuracyTrendChart attempts={examAttempts} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FlashcardDueWidget dueCount={dueCount} totalCount={totalCards} streak={streak} />
          <TimeSpentWidget sessions={sessions} />
        </div>
      </div>
    </div>
  )
}