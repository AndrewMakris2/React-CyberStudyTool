import { recordStudySession, getTodaySession } from '../db';

let sessionInterval: ReturnType<typeof setInterval> | null = null;
let sessionStartTime: Date | null = null;

export function startSessionTimer(): void {
  if (sessionInterval) return;
  sessionStartTime = new Date();

  sessionInterval = setInterval(async () => {
    await flushSession();
  }, 60_000); // flush every minute
}

export function stopSessionTimer(): void {
  if (sessionInterval) {
    clearInterval(sessionInterval);
    sessionInterval = null;
  }
  flushSession();
  sessionStartTime = null;
}

export async function flushSession(): Promise<void> {
  if (!sessionStartTime) return;

  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - sessionStartTime.getTime()) / 1000);
  if (durationSeconds < 10) return;

  const existing = await getTodaySession();
  if (existing?.id) {
    const { db } = await import('../db');
    await db.studySessions.update(existing.id, {
      durationSeconds: (existing.durationSeconds ?? 0) + durationSeconds,
    });
  } else {
    await recordStudySession({
      date: new Date(),
      durationSeconds,
      activitiesCompleted: [],
    });
  }

  sessionStartTime = new Date(); // reset so we don't double-count
}