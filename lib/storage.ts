import { SessionSummary } from "@/types/viscoach";

export const STORAGE_KEYS = {
  profile: "viscoach.profile",
  sessions: "viscoach.sessions"
} as const;

export function loadStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStoredValue(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

export function calculateCurrentStreak(sessions: SessionSummary[]) {
  const uniqueDays = Array.from(
    new Set(sessions.map((session) => session.completedAt.slice(0, 10)))
  ).sort((a, b) => b.localeCompare(a));

  if (!uniqueDays.length) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day !== expected) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function averageFormScore(sessions: SessionSummary[]) {
  if (!sessions.length) {
    return 0;
  }

  return Math.round(
    sessions.reduce((sum, session) => sum + session.avgFormScore, 0) /
      sessions.length
  );
}

export function totalReps(sessions: SessionSummary[]) {
  return sessions.reduce((sum, session) => sum + session.reps, 0);
}

export function mostCommonCorrectionFromSessions(sessions: SessionSummary[]) {
  const cueTotals = sessions.reduce<Record<string, number>>((accumulator, session) => {
    for (const [cue, count] of Object.entries(session.cueCounts)) {
      accumulator[cue] = (accumulator[cue] ?? 0) + count;
    }
    return accumulator;
  }, {});

  const [topCue] =
    Object.entries(cueTotals).sort((left, right) => right[1] - left[1])[0] ?? [];

  return topCue ?? "Ready for a first session";
}

export function formatRelativeSessionDate(timestamp: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
