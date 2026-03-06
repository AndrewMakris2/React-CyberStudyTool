import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSettingsStore } from './store/useSettingsStore'
import { useAppStore } from './store/useAppStore'
import { startSessionTimer, stopSessionTimer } from './utils/sessionTimer'
import Layout from './components/layout/Layout'
import SetupPage from './pages/SetupPage'
import DashboardPage from './pages/DashboardPage'
import ObjectivesPage from './pages/ObjectivesPage'
import TutorPage from './pages/TutorPage'
import NotesPage from './pages/NotesPage'
import FlashcardsPage from './pages/FlashcardsPage'
import PracticePage from './pages/PracticePage'
import ExamPage from './pages/ExamPage'
import LabsPage from './pages/LabsPage'
import KnowledgePage from './pages/KnowledgePage'
import SettingsPage from './pages/SettingsPage'
import Toast from './components/ui/Toast'

function App() {
  const groqApiKey = useSettingsStore(s => s.groqApiKey)
  const isFirstRun = useAppStore(s => s.isFirstRun)
  const setFirstRun = useAppStore(s => s.setFirstRun)

  useEffect(() => {
    if (groqApiKey) setFirstRun(false)
  }, [groqApiKey, setFirstRun])

  useEffect(() => {
    startSessionTimer()
    return () => stopSessionTimer()
  }, [])

  const needsSetup = !groqApiKey || isFirstRun

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        {needsSetup ? (
          <Route path="*" element={<Navigate to="/setup" replace />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/objectives" element={<ObjectivesPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App