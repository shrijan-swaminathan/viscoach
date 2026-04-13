import { ExerciseDefinition, ExerciseId } from "@/types/viscoach";

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: "squat",
    name: "Velocity Squat",
    tagline: "Leg drive, hip depth, and trunk position.",
    summary:
      "Use a controlled bodyweight squat to build confidence and get real-time cues on depth and torso position.",
    focus: ["Hip depth", "Chest position", "Drive out of the bottom"],
    tutorialVideo: {
      title: "Squat tutorial",
      creator: "FitnessFAQs",
      description:
        "Covers stance, bracing, and how to hit depth without folding forward.",
      embedUrl: "https://www.youtube-nocookie.com/embed/-W19J4VR7D0",
      watchUrl: "https://www.youtube.com/watch?v=-W19J4VR7D0"
    },
    coachingHighlights: ["Lower your hips.", "Keep chest up."]
  },
  {
    id: "pushup",
    name: "Pulse Push-Up",
    tagline: "Midline control and smooth pressing reps.",
    summary:
      "Track shoulder, hip, and ankle alignment while counting clean push-up reps directly from your camera feed.",
    focus: ["Body-line stability", "Depth control", "Press timing"],
    tutorialVideo: {
      title: "Push-up tutorial",
      creator: "FitnessFAQs",
      description:
        "Walks through hand placement, body-line tension, and a full-range press.",
      embedUrl: "https://www.youtube-nocookie.com/embed/-WXc4E-zcao",
      watchUrl: "https://www.youtube.com/watch?v=-WXc4E-zcao"
    },
    coachingHighlights: ["Back is straight.", "Hips sagging."]
  },
  {
    id: "lunge",
    name: "Stability Lunge",
    tagline: "Single-leg balance, knee tracking, and control.",
    summary:
      "Step into alternating lunges and get immediate feedback on front-knee travel and bottom-position depth.",
    focus: ["Front-knee alignment", "Stride balance", "Lower-body control"],
    tutorialVideo: {
      title: "Lunge tutorial",
      creator: "Dana the PT",
      description:
        "Focuses on step length, front-knee tracking, and staying balanced at the bottom.",
      embedUrl: "https://www.youtube-nocookie.com/embed/3KBAEzNJckY",
      watchUrl: "https://www.youtube.com/watch?v=3KBAEzNJckY"
    },
    coachingHighlights: ["Front knee too far forward.", "Sink lower into the lunge."]
  }
];

export function getExerciseById(id: ExerciseId | string) {
  return EXERCISES.find((exercise) => exercise.id === id);
}
