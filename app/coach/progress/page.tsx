"use client";

import { useAppState } from "@/components/app-state-provider";
import { formatRelativeSessionDate } from "@/lib/storage";
import Link from "next/link";

export default function ProgressPage() {
  const {
    averageScore,
    currentStreak,
    sessions,
    totalRepCount,
    mostCommonCorrection
  } = useAppState();

  const maxScore = Math.max(...sessions.map((session) => session.avgFormScore), 1);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <div className="panel p-6 sm:p-8">
          <p className="eyebrow">Progress</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-none">
            Session metrics that feel real enough for the demo.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-mist/75">
            Each saved workout stores reps, average form score, duration, and the
            most common correction. It is intentionally local, but it still gives
            the product a believable feedback loop.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Average form", value: sessions.length ? `${averageScore}%` : "--" },
            { label: "Current streak", value: sessions.length ? `${currentStreak}` : "--" },
            { label: "Total reps", value: sessions.length ? `${totalRepCount}` : "--" },
            {
              label: "Most common correction",
              value: sessions.length ? mostCommonCorrection.replaceAll("-", " ") : "--"
            }
          ].map((item) => (
            <div key={item.label} className="panel-subtle p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                {item.label}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Form trend</p>
          {sessions.length ? (
            <div className="mt-6 flex items-end gap-3">
              {sessions.slice(0, 6).reverse().map((session) => (
                <div key={session.id} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-48 w-full items-end rounded-[18px] border border-white/10 bg-white/[0.03] p-2">
                    <div
                      className="w-full rounded-[12px] bg-gradient-to-t from-lime via-lime/90 to-emerald-200"
                      style={{
                        height: `${Math.max(16, (session.avgFormScore / maxScore) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-center text-xs uppercase tracking-[0.18em] text-mist/55">
                    {session.exerciseName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-white/[0.15] px-5 py-8 text-sm text-mist/65">
              No session data yet. Start one from the library to generate the first
              metrics.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="panel p-5">
          <p className="eyebrow">Session history</p>
          {sessions.length ? (
            <div className="mt-4 space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-3xl font-semibold text-white">
                        {session.exerciseName}
                      </h2>
                      <p className="mt-2 text-sm text-mist/65">
                        {formatRelativeSessionDate(session.completedAt)}
                      </p>
                    </div>
                    <div className="chip">{session.durationSeconds}s</div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      `${session.reps} reps`,
                      `${session.avgFormScore}% form`,
                      session.mostCommonCorrection.replaceAll("-", " ")
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
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-white/[0.15] px-5 py-8 text-sm text-mist/65">
              Nothing saved yet. The progress screen will populate after the first
              workout ends.
            </div>
          )}
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Next move</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            Keep the loop tight.
          </h2>
          <p className="mt-3 text-sm leading-6 text-mist/75">
            For a strong class demo, run onboarding once, complete a short camera
            session, then return here to show the saved summary.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/coach/library" className="button-primary">
              Start another workout
            </Link>
            <Link href="/coach/dashboard" className="button-secondary">
              Open dashboard
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
