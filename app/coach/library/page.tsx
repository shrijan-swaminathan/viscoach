"use client";

import { useAppState } from "@/components/app-state-provider";
import { EXERCISES } from "@/lib/exercises";
import Link from "next/link";

export default function LibraryPage() {
  const { profile } = useAppState();

  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Exercise library</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-none">
              Pick a movement and start the demo loop.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-mist/75">
              The MVP keeps the supported set intentionally small: squat, push-up,
              and lunge. That matches the wireframe’s exercise-library idea without
              overextending the pose-estimation logic.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-mist/75">
            Recommended lane:{" "}
            <span className="font-semibold text-white">
              {profile?.movementPreferences
                .join(", ")
                .replaceAll("-", " ") ?? "bodyweight foundations"}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {EXERCISES.map((exercise) => (
          <article
            key={exercise.id}
            className="panel relative overflow-hidden p-5 sm:p-6"
          >
            <div
              className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${exercise.heroTone}`}
            />
            <div className="relative">
              <p className="chip">{exercise.tagline}</p>
              <h2 className="mt-5 font-display text-4xl font-semibold">
                {exercise.name}
              </h2>
              <p className="mt-4 text-sm leading-6 text-mist/75">
                {exercise.summary}
              </p>

              <div className="mt-6 space-y-3">
                {exercise.focus.map((focus) => (
                  <div
                    key={focus}
                    className={`rounded-[20px] border border-white/10 bg-gradient-to-r p-4 ${exercise.surfaceTone}`}
                  >
                    <p className="text-sm text-white">{focus}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/coach/workout/${exercise.id}`}
                  className="button-primary"
                >
                  Start workout
                </Link>
                <Link href="/coach/progress" className="button-secondary">
                  View progress
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
