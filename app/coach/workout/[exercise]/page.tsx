"use client";

import { WorkoutStudio } from "@/components/workout-studio";
import { getExerciseById } from "@/lib/exercises";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExerciseWorkoutPage() {
  const params = useParams<{ exercise: string }>();
  const exercise = getExerciseById(params.exercise);

  if (!exercise) {
    return (
      <div className="panel p-8">
        <p className="eyebrow">Workout</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          That exercise is not part of the current library.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-mist/75">
          Use squat, push-up, or lunge to stay inside the supported coaching flow.
        </p>
        <Link href="/coach/library" className="button-primary mt-6">
          Back to library
        </Link>
      </div>
    );
  }

  return <WorkoutStudio exercise={exercise} />;
}
