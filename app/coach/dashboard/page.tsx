"use client";

import { useAppState } from "@/components/app-state-provider";
import { getExerciseById } from "@/lib/exercises";
import { formatRelativeSessionDate } from "@/lib/storage";
import Link from "next/link";

function chooseRecommendedExercise(movementPreferences: string[]) {
  if (movementPreferences.includes("strength")) {
    return getExerciseById("pushup");
  }

  if (movementPreferences.includes("mobility")) {
    return getExerciseById("lunge");
  }

  return getExerciseById("squat");
}

export default function DashboardPage() {
  const {
    averageScore,
    currentStreak,
    isHydrated,
    mostCommonCorrection,
    profile,
    sessions,
    totalRepCount
  } = useAppState();

  const recommendedExercise = chooseRecommendedExercise(
    profile?.movementPreferences ?? []
  );
  const latestSession = sessions[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 hidden bg-gradient-to-br from-lime/10 via-transparent to-transparent lg:block" />
        <div className="relative">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-none">
            Ready for your next form check.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist/75">
            This dashboard keeps you oriented, recommends the next session, and
            surfaces local progress without requiring a backend.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Live streak",
                value: isHydrated ? `${currentStreak}` : "--",
                note: "Consecutive active days"
              },
              {
                label: "Avg. form",
                value: sessions.length ? `${averageScore}%` : "--",
                note: "Across saved sessions"
              },
              {
                label: "Total reps",
                value: isHydrated ? `${totalRepCount}` : "--",
                note: "Combined across exercises"
              },
              {
                label: "Sessions",
                value: isHydrated ? `${sessions.length}` : "--",
                note: "Saved locally on this device"
              }
            ].map((item) => (
              <div key={item.label} className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                  {item.label}
                </p>
                <p className="mt-3 metric-value">{item.value}</p>
                <p className="mt-2 text-xs text-mist/60">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[30px] border border-lime/20 bg-gradient-to-br from-lime/[0.14] via-lime/[0.05] to-transparent p-6">
              <p className="chip">Recommended next move</p>
              <h2 className="mt-4 font-display text-4xl font-semibold">
                {recommendedExercise?.name ?? "Velocity Squat"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-mist/75">
                {recommendedExercise?.summary ??
                  "Start with the squat flow to build confidence and sharpen your form."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/coach/workout/${recommendedExercise?.id ?? "squat"}`}
                  className="button-primary"
                >
                  Start workout
                </Link>
                <Link href="/coach/library" className="button-secondary">
                  Explore library
                </Link>
              </div>
            </div>

            <div className="panel-subtle p-6">
              <p className="eyebrow">Profile snapshot</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-mist/75">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                    Motivations
                  </p>
                  <p className="mt-2 text-white">
                    {profile?.motivation.join(", ").replaceAll("-", " ") ??
                      "Complete onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                    Goals
                  </p>
                  <p className="mt-2 text-white">
                    {profile?.goals.join(", ").replaceAll("-", " ") ??
                      "Waiting for onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                    Movement lane
                  </p>
                  <p className="mt-2 text-white">
                    {profile?.movementPreferences
                      .join(", ")
                      .replaceAll("-", " ") ?? "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="panel p-5">
          <p className="eyebrow">Most common correction</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            {mostCommonCorrection.replaceAll("-", " ")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-mist/75">
            This surfaces the pattern that shows up most often across your saved
            sessions, even while progress stays device-local.
          </p>
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Latest session</p>
          {latestSession ? (
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-3xl font-semibold text-white">
                {latestSession.exerciseName}
              </p>
              <p className="mt-2 text-sm text-mist/70">
                {formatRelativeSessionDate(latestSession.completedAt)}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  `${latestSession.reps} reps`,
                  `${latestSession.avgFormScore}% form`,
                  `${latestSession.durationSeconds}s`
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-4 text-center text-sm text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-white/[0.15] px-5 py-8 text-sm text-mist/65">
              No saved session yet. Start in the exercise library and the dashboard
              will begin filling itself in.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
