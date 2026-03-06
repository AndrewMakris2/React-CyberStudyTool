import { create } from 'zustand'
import type { CertId, TutorMode, TutorToggles, ChatMessage, ExamAttempt } from '../types'

interface AppState {
  activeCertId: CertId
  activeDomainId: string | null
  setActiveCert: (certId: CertId) => void
  setActiveDomain: (domainId: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  tutorMode: TutorMode
  setTutorMode: (mode: TutorMode) => void
  tutorToggles: TutorToggles
  setTutorToggle: (key: keyof TutorToggles, value: boolean) => void
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void
  chatSessionId: number | null
  setChatSessionId: (id: number | null) => void
  isChatStreaming: boolean
  setChatStreaming: (streaming: boolean) => void
  practiceLoading: boolean
  setPracticeLoading: (loading: boolean) => void
  currentExam: ExamAttempt | null
  setCurrentExam: (exam: ExamAttempt | null) => void
  examCurrentIndex: number
  setExamCurrentIndex: (index: number) => void
  examFlagged: number[]
  toggleExamFlag: (index: number) => void
  examAnswers: Record<number, string[]>
  setExamAnswer: (index: number, answers: string[]) => void
  examStartTime: Date | null
  setExamStartTime: (date: Date | null) => void
  examFinished: boolean
  setExamFinished: (finished: boolean) => void
  currentLabId: string | null
  setCurrentLabId: (id: string | null) => void
  labHintsRevealed: number
  revealNextHint: () => void
  resetLabHints: () => void
  labRubricRevealed: boolean
  setLabRubricRevealed: (revealed: boolean) => void
  sessionStartTime: Date
  resetSession: () => void
  isFirstRun: boolean
  setFirstRun: (val: boolean) => void
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info' | 'warning'
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  clearToast: () => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  activeCertId: 'security-plus',
  activeDomainId: null,
  setActiveCert: (certId) => set({ activeCertId: certId, activeDomainId: null }),
  setActiveDomain: (domainId) => set({ activeDomainId: domainId }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  tutorMode: 'explain',
  setTutorMode: (mode) => set({ tutorMode: mode }),
  tutorToggles: { showSteps: true, citeSources: false },
  setTutorToggle: (key, value) =>
    set(s => ({ tutorToggles: { ...s.tutorToggles, [key]: value } })),
  chatMessages: [],
  addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [], chatSessionId: null }),
  chatSessionId: null,
  setChatSessionId: (id) => set({ chatSessionId: id }),
  isChatStreaming: false,
  setChatStreaming: (streaming) => set({ isChatStreaming: streaming }),
  practiceLoading: false,
  setPracticeLoading: (loading) => set({ practiceLoading: loading }),
  currentExam: null,
  setCurrentExam: (exam) => set({ currentExam: exam }),
  examCurrentIndex: 0,
  setExamCurrentIndex: (index) => set({ examCurrentIndex: index }),
  examFlagged: [],
  toggleExamFlag: (index) =>
    set(s => ({
      examFlagged: s.examFlagged.includes(index)
        ? s.examFlagged.filter(i => i !== index)
        : [...s.examFlagged, index],
    })),
  examAnswers: {},
  setExamAnswer: (index, answers) =>
    set(s => ({ examAnswers: { ...s.examAnswers, [index]: answers } })),
  examStartTime: null,
  setExamStartTime: (date) => set({ examStartTime: date }),
  examFinished: false,
  setExamFinished: (finished) => set({ examFinished: finished }),
  currentLabId: null,
  setCurrentLabId: (id) => set({ currentLabId: id }),
  labHintsRevealed: 0,
  revealNextHint: () => set(s => ({ labHintsRevealed: s.labHintsRevealed + 1 })),
  resetLabHints: () => set({ labHintsRevealed: 0, labRubricRevealed: false }),
  labRubricRevealed: false,
  setLabRubricRevealed: (revealed) => set({ labRubricRevealed: revealed }),
  sessionStartTime: new Date(),
  resetSession: () => set({ sessionStartTime: new Date() }),
  isFirstRun: true,
  setFirstRun: (val) => set({ isFirstRun: val }),
  toastMessage: null,
  toastType: 'info',
  showToast: (msg, type = 'info') => {
    set({ toastMessage: msg, toastType: type })
    setTimeout(() => get().clearToast(), 4000)
  },
  clearToast: () => set({ toastMessage: null }),
}))