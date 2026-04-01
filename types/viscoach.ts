export type ExerciseId = "squat" | "pushup" | "lunge";

export type MotivationId =
  | "start-routine"
  | "build-confidence"
  | "move-pain-free"
  | "train-smarter";

export type GoalId =
  | "improve-form"
  | "gain-strength"
  | "stay-consistent"
  | "protect-joints";

export type MovementPreferenceId =
  | "bodyweight"
  | "strength"
  | "mobility"
  | "hybrid";

export type StartTimingId = "today" | "this-week" | "need-plan";

export interface OnboardingProfile {
  motivation: MotivationId[];
  goals: GoalId[];
  privacyAccepted: boolean;
  movementPreferences: MovementPreferenceId[];
  startTiming: StartTimingId;
  completedAt: string;
}

export interface SessionSummary {
  id: string;
  exerciseId: ExerciseId;
  exerciseName: string;
  completedAt: string;
  reps: number;
  avgFormScore: number;
  mostCommonCorrection: string;
  durationSeconds: number;
  cueCounts: Record<string, number>;
}

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  tagline: string;
  summary: string;
  focus: string[];
  coachingHighlights: string[];
  heroTone: string;
  surfaceTone: string;
}
