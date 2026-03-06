import type { Flashcard, FlashcardRating } from '../types';

// ─── SM-2 Algorithm Implementation ───────────────────────────────────────────
// Based on the SuperMemo SM-2 algorithm
// https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

interface SM2Result {
  interval: number;       // days until next review
  repetitions: number;
  easeFactor: number;
  dueDate: Date;
}

/**
 * Calculate next review schedule using SM-2 algorithm
 * Ratings map: again=0, hard=3, good=4, easy=5
 */
export function calculateNextReview(
  card: Flashcard,
  rating: FlashcardRating
): SM2Result {
  const qualityMap: Record<FlashcardRating, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  };

  const q = qualityMap[rating];
  let { interval, repetitions, easeFactor } = card;

  if (q < 3) {
    // Failed recall — reset
    interval = 1;
    repetitions = 0;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  // Apply rating-specific modifiers
  if (rating === 'easy') {
    interval = Math.round(interval * 1.3);
    easeFactor = Math.min(easeFactor + 0.15, 4.0);
  } else if (rating === 'hard') {
    interval = Math.max(1, Math.round(interval * 0.8));
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  dueDate.setHours(0, 0, 0, 0);

  return { interval, repetitions, easeFactor, dueDate };
}

/**
 * Create a new flashcard with default SM-2 values (due immediately)
 */
export function createCardDefaults(): Pick<Flashcard, 'interval' | 'repetitions' | 'easeFactor' | 'dueDate'> {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    dueDate: new Date(),
  };
}

/**
 * Sort cards: due first, then by ease factor ascending (hardest first)
 */
export function sortDueCards(cards: Flashcard[]): Flashcard[] {
  const now = new Date();
  return [...cards].sort((a, b) => {
    const aDue = a.dueDate <= now;
    const bDue = b.dueDate <= now;
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    return a.easeFactor - b.easeFactor;
  });
}

/**
 * Get study streak from study sessions
 */
export function calculateStreak(sessionDates: Date[]): number {
  if (!sessionDates.length) return 0;

  const sorted = [...sessionDates]
    .map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a);

  const unique = [...new Set(sorted)];

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    expected.setHours(0, 0, 0, 0);

    if (unique[i] === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}