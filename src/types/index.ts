export type CertId =
  | 'security-plus'
  | 'network-plus'
  | 'cysa-plus'
  | 'pentest-plus'
  | 'sscp'
  | 'cissp'
  | 'az-500'
  | 'sc-200';

export interface Cert {
  id: CertId;
  name: string;
  vendor: string;
  color: string;
  domains: Domain[];
}

export interface Domain {
  id: string;
  certId: CertId;
  name: string;
  weight: number;
  objectives: Objective[];
}

export interface Objective {
  id: string;
  domainId: string;
  certId: CertId;
  code: string;
  title: string;
  description: string;
  keywords: string[];
}

export type ObjectiveStatus = 'not-started' | 'learning' | 'review' | 'mastered';

export interface ObjectiveProgress {
  id?: number;
  objectiveId: string;
  certId: CertId;
  status: ObjectiveStatus;
  updatedAt: Date;
}

export interface Deck {
  id?: number;
  name: string;
  certId: CertId;
  domainId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  type: 'basic' | 'cloze';
  tags: string[];
  certId: CertId;
  domainId?: string;
  objectiveId?: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: Date;
  lastReviewed?: Date;
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export type QuestionType = 'multiple-choice' | 'multiple-response' | 'scenario' | 'pbq';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id?: number;
  certId: CertId;
  domainId: string;
  objectiveIds: string[];
  type: QuestionType;
  difficulty: Difficulty;
  stem: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
  wrongAnswerExplanations: Record<string, string>;
  tags: string[];
  createdAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface ExamConfig {
  certId: CertId;
  domainIds: string[];
  questionCount: number;
  timeLimitMinutes: number;
  difficulty: Difficulty | 'mixed';
}

export interface ExamAttempt {
  id?: number;
  certId: CertId;
  config: ExamConfig;
  questions: PracticeQuestion[];
  answers: Record<number, string[]>;
  flagged: number[];
  startedAt: Date;
  completedAt?: Date;
  score?: ExamScore;
}

export interface ExamScore {
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  domainBreakdown: DomainScore[];
  objectiveWeaknesses: string[];
  timeTakenSeconds: number;
}

export interface DomainScore {
  domainId: string;
  domainName: string;
  correct: number;
  total: number;
  percentage: number;
}

export type TutorMode = 'socratic' | 'explain' | 'exam-coach';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mode?: TutorMode;
}

export interface ChatSession {
  id?: number;
  certId: CertId;
  domainId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorToggles {
  showSteps: boolean;
  citeSources: boolean;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  certId: CertId;
  domainId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedSummary {
  id?: number;
  noteId: number;
  summary: string;
  keyTerms: KeyTerm[];
  createdAt: Date;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export type LabType =
  | 'log-analysis'
  | 'network-troubleshooting'
  | 'incident-response'
  | 'threat-modeling'
  | 'vulnerability-triage';

export interface Lab {
  id: string;
  type: LabType;
  title: string;
  certId: CertId;
  domainId: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prompt: string;
  scenario: string;
  rubric: LabRubric;
  hints: string[];
  modelAnswer?: string;
}

export interface LabRubric {
  criteria: RubricCriterion[];
  maxScore: number;
}

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  points: number;
}

export interface LabAttempt {
  id?: number;
  labId: string;
  certId: CertId;
  userResponse: string;
  feedback?: LabFeedback;
  score?: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface LabFeedback {
  overallScore: number;
  maxScore: number;
  criteriaResults: CriterionResult[];
  strengths: string[];
  improvements: string[];
  actionableNext: string[];
}

export interface CriterionResult {
  criterionId: string;
  label: string;
  earned: number;
  max: number;
  feedback: string;
}

export type KnowledgeItemType = 'definition' | 'procedure' | 'command' | 'cheatsheet' | 'reference';

export interface KnowledgeItem {
  id?: number;
  type: KnowledgeItemType;
  title: string;
  content: string;
  certId?: CertId;
  domainId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  groqApiKey: string;
  groqModel: string;
  activeCertIds: CertId[];
  primaryCertId: CertId;
  theme: 'dark' | 'light';
  streamingEnabled: boolean;
}

export interface StudySession {
  id?: number;
  date: Date;
  durationSeconds: number;
  activitiesCompleted: string[];
}

export interface SearchResult {
  id: number;
  type: 'objective' | 'note' | 'knowledge' | 'flashcard';
  title: string;
  excerpt: string;
  score: number;
  certId?: CertId;
}

export interface ExportBundle {
  version: string;
  exportedAt: string;
  objectiveProgress: ObjectiveProgress[];
  decks: Deck[];
  flashcards: Flashcard[];
  notes: Note[];
  knowledgeItems: KnowledgeItem[];
  examAttempts: ExamAttempt[];
  labAttempts: LabAttempt[];
  studySessions: StudySession[];
}