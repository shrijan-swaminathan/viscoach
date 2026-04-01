import { ExerciseDefinition, ExerciseId } from "@/types/viscoach";

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: "squat",
    name: "Velocity Squat",
    tagline: "Leg drive, hip depth, and trunk position.",
    summary:
      "Use a controlled bodyweight squat to build confidence and get real-time cues on depth and torso position.",
    focus: ["Hip depth", "Chest position", "Drive out of the bottom"],
    coachingHighlights: ["Lower your hips.", "Keep chest up."],
    heroTone: "from-lime/30 via-lime/10 to-transparent",
    surfaceTone: "from-lime/15 via-transparent to-emerald-500/10"
  },
  {
    id: "pushup",
    name: "Pulse Push-Up",
    tagline: "Midline control and smooth pressing reps.",
    summary:
      "Track shoulder, hip, and ankle alignment while counting clean push-up reps directly from your camera feed.",
    focus: ["Body-line stability", "Depth control", "Press timing"],
    coachingHighlights: ["Back is straight.", "Hips sagging."],
    heroTone: "from-orange-500/25 via-orange-500/10 to-transparent",
    surfaceTone: "from-orange-500/15 via-transparent to-rose-500/10"
  },
  {
    id: "lunge",
    name: "Stability Lunge",
    tagline: "Single-leg balance, knee tracking, and control.",
    summary:
      "Step into alternating lunges and get immediate feedback on front-knee travel and bottom-position depth.",
    focus: ["Front-knee alignment", "Stride balance", "Lower-body control"],
    coachingHighlights: ["Front knee too far forward.", "Sink lower into the lunge."],
    heroTone: "from-sky-400/25 via-cyan-400/10 to-transparent",
    surfaceTone: "from-sky-400/15 via-transparent to-teal-500/10"
  }
];

export function getExerciseById(id: ExerciseId | string) {
  return EXERCISES.find((exercise) => exercise.id === id);
}
