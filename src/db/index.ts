import Dexie, { type Table } from 'dexie';
import type {
  ObjectiveProgress,
  Deck,
  Flashcard,
  Note,
  GeneratedSummary,
  PracticeQuestion,
  ExamAttempt,
  LabAttempt,
  KnowledgeItem,
  StudySession,
  ChatSession,
} from '../types';

export class CyberCertDB extends Dexie {
  objectiveProgress!: Table<ObjectiveProgress>;
  decks!: Table<Deck>;
  flashcards!: Table<Flashcard>;
  notes!: Table<Note>;
  summaries!: Table<GeneratedSummary>;
  practiceQuestions!: Table<PracticeQuestion>;
  examAttempts!: Table<ExamAttempt>;
  labAttempts!: Table<LabAttempt>;
  knowledgeItems!: Table<KnowledgeItem>;
  studySessions!: Table<StudySession>;
  chatSessions!: Table<ChatSession>;

  constructor() {
    super('CyberCertStudyDB');

    this.version(1).stores({
      objectiveProgress: '++id, objectiveId, certId, status, updatedAt',
      decks: '++id, certId, domainId, name, createdAt',
      flashcards: '++id, deckId, certId, domainId, dueDate, type',
      notes: '++id, certId, domainId, title, createdAt',
      summaries: '++id, noteId, createdAt',
      practiceQuestions: '++id, certId, domainId, type, difficulty, createdAt',
      examAttempts: '++id, certId, startedAt, completedAt',
      labAttempts: '++id, labId, certId, startedAt, completedAt',
      knowledgeItems: '++id, certId, domainId, type, title, createdAt',
      studySessions: '++id, date',
      chatSessions: '++id, certId, domainId, createdAt',
    });
  }
}

export const db = new CyberCertDB();

// ─── Objective Progress ──────────────────────────────────────────────────────

export async function getObjectiveProgress(objectiveId: string) {
  return db.objectiveProgress.where('objectiveId').equals(objectiveId).first();
}

export async function setObjectiveProgress(
  objectiveId: string,
  certId: string,
  status: ObjectiveProgress['status']
) {
  const existing = await getObjectiveProgress(objectiveId);
  if (existing?.id) {
    await db.objectiveProgress.update(existing.id, { status, updatedAt: new Date() });
  } else {
    await db.objectiveProgress.add({
      objectiveId,
      certId: certId as any,
      status,
      updatedAt: new Date(),
    });
  }
}

export async function getAllProgressForCert(certId: string) {
  return db.objectiveProgress.where('certId').equals(certId).toArray();
}

// ─── Decks & Flashcards ──────────────────────────────────────────────────────

export async function createDeck(deck: Omit<Deck, 'id'>) {
  return db.decks.add(deck);
}

export async function getDecks(certId?: string) {
  if (certId) return db.decks.where('certId').equals(certId).toArray();
  return db.decks.toArray();
}

export async function getDeckById(id: number) {
  return db.decks.get(id);
}

export async function updateDeck(id: number, changes: Partial<Deck>) {
  return db.decks.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteDeck(id: number) {
  await db.flashcards.where('deckId').equals(id).delete();
  await db.decks.delete(id);
}

export async function addFlashcard(card: Omit<Flashcard, 'id'>) {
  return db.flashcards.add(card);
}

export async function addFlashcards(cards: Omit<Flashcard, 'id'>[]) {
  return db.flashcards.bulkAdd(cards);
}

export async function getFlashcardsByDeck(deckId: number) {
  return db.flashcards.where('deckId').equals(deckId).toArray();
}

export async function getDueFlashcards(certId?: string) {
  const now = new Date();
  let query = db.flashcards.filter((c) => c.dueDate <= now);
  const all = await query.toArray();
  if (certId) return all.filter((c) => c.certId === certId);
  return all;
}

export async function updateFlashcard(id: number, changes: Partial<Flashcard>) {
  return db.flashcards.update(id, changes);
}

export async function deleteFlashcard(id: number) {
  return db.flashcards.delete(id);
}

export async function getDueCount(certId?: string) {
  const due = await getDueFlashcards(certId);
  return due.length;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function saveNote(note: Omit<Note, 'id'>) {
  return db.notes.add(note);
}

export async function updateNote(id: number, changes: Partial<Note>) {
  return db.notes.update(id, { ...changes, updatedAt: new Date() });
}

export async function getNotes(certId?: string) {
  if (certId) return db.notes.where('certId').equals(certId).toArray();
  return db.notes.toArray();
}

export async function getNoteById(id: number) {
  return db.notes.get(id);
}

export async function deleteNote(id: number) {
  await db.summaries.where('noteId').equals(id).delete();
  await db.notes.delete(id);
}

export async function saveSummary(summary: Omit<GeneratedSummary, 'id'>) {
  const existing = await db.summaries.where('noteId').equals(summary.noteId).first();
  if (existing?.id) {
    await db.summaries.update(existing.id, summary);
    return existing.id;
  }
  return db.summaries.add(summary);
}

export async function getSummaryForNote(noteId: number) {
  return db.summaries.where('noteId').equals(noteId).first();
}

// ─── Practice Questions ───────────────────────────────────────────────────────

export async function savePracticeQuestions(questions: Omit<PracticeQuestion, 'id'>[]) {
  return db.practiceQuestions.bulkAdd(questions);
}

export async function getPracticeQuestions(certId?: string, domainId?: string) {
  let all = await db.practiceQuestions.toArray();
  if (certId) all = all.filter((q) => q.certId === certId);
  if (domainId) all = all.filter((q) => q.domainId === domainId);
  return all;
}

export async function deletePracticeQuestion(id: number) {
  return db.practiceQuestions.delete(id);
}

// ─── Exam Attempts ────────────────────────────────────────────────────────────

export async function saveExamAttempt(attempt: Omit<ExamAttempt, 'id'>) {
  return db.examAttempts.add(attempt);
}

export async function updateExamAttempt(id: number, changes: Partial<ExamAttempt>) {
  return db.examAttempts.update(id, changes);
}

export async function getExamAttempts(certId?: string) {
  if (certId) return db.examAttempts.where('certId').equals(certId).toArray();
  return db.examAttempts.toArray();
}

export async function getExamAttemptById(id: number) {
  return db.examAttempts.get(id);
}

// ─── Lab Attempts ─────────────────────────────────────────────────────────────

export async function saveLabAttempt(attempt: Omit<LabAttempt, 'id'>) {
  return db.labAttempts.add(attempt);
}

export async function updateLabAttempt(id: number, changes: Partial<LabAttempt>) {
  return db.labAttempts.update(id, changes);
}

export async function getLabAttempts(certId?: string) {
  if (certId) return db.labAttempts.where('certId').equals(certId).toArray();
  return db.labAttempts.toArray();
}

// ─── Knowledge Items ──────────────────────────────────────────────────────────

export async function saveKnowledgeItem(item: Omit<KnowledgeItem, 'id'>) {
  return db.knowledgeItems.add(item);
}

export async function updateKnowledgeItem(id: number, changes: Partial<KnowledgeItem>) {
  return db.knowledgeItems.update(id, { ...changes, updatedAt: new Date() });
}

export async function getKnowledgeItems(certId?: string) {
  if (certId) {
    return db.knowledgeItems.filter((i) => !i.certId || i.certId === certId).toArray();
  }
  return db.knowledgeItems.toArray();
}

export async function deleteKnowledgeItem(id: number) {
  return db.knowledgeItems.delete(id);
}

// ─── Study Sessions ───────────────────────────────────────────────────────────

export async function recordStudySession(session: Omit<StudySession, 'id'>) {
  return db.studySessions.add(session);
}

export async function getStudySessions() {
  return db.studySessions.orderBy('date').toArray();
}

export async function getTodaySession() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db.studySessions.filter((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).first();
}

// ─── Chat Sessions ────────────────────────────────────────────────────────────

export async function saveChatSession(session: Omit<ChatSession, 'id'>) {
  return db.chatSessions.add(session);
}

export async function updateChatSession(id: number, changes: Partial<ChatSession>) {
  return db.chatSessions.update(id, { ...changes, updatedAt: new Date() });
}

export async function getChatSessions(certId?: string) {
  if (certId) return db.chatSessions.where('certId').equals(certId).toArray();
  return db.chatSessions.toArray();
}

// ─── Full Export ──────────────────────────────────────────────────────────────

export async function exportAllData() {
  const [
    objectiveProgress,
    decks,
    flashcards,
    notes,
    knowledgeItems,
    examAttempts,
    labAttempts,
    studySessions,
  ] = await Promise.all([
    db.objectiveProgress.toArray(),
    db.decks.toArray(),
    db.flashcards.toArray(),
    db.notes.toArray(),
    db.knowledgeItems.toArray(),
    db.examAttempts.toArray(),
    db.labAttempts.toArray(),
    db.studySessions.toArray(),
  ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    objectiveProgress,
    decks,
    flashcards,
    notes,
    knowledgeItems,
    examAttempts,
    labAttempts,
    studySessions,
  };
}

export async function importAllData(bundle: any) {
  await db.transaction('rw', [
    db.objectiveProgress,
    db.decks,
    db.flashcards,
    db.notes,
    db.knowledgeItems,
    db.examAttempts,
    db.labAttempts,
    db.studySessions,
  ], async () => {
    if (bundle.objectiveProgress?.length) await db.objectiveProgress.bulkPut(bundle.objectiveProgress);
    if (bundle.decks?.length) await db.decks.bulkPut(bundle.decks);
    if (bundle.flashcards?.length) await db.flashcards.bulkPut(bundle.flashcards);
    if (bundle.notes?.length) await db.notes.bulkPut(bundle.notes);
    if (bundle.knowledgeItems?.length) await db.knowledgeItems.bulkPut(bundle.knowledgeItems);
    if (bundle.examAttempts?.length) await db.examAttempts.bulkPut(bundle.examAttempts);
    if (bundle.labAttempts?.length) await db.labAttempts.bulkPut(bundle.labAttempts);
    if (bundle.studySessions?.length) await db.studySessions.bulkPut(bundle.studySessions);
  });
}