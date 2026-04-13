"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { useAppState } from "@/components/app-state-provider";

const NAV_ITEMS = [
  { href: "/coach/dashboard", label: "Dashboard" },
  { href: "/coach/library", label: "Exercise library" },
  { href: "/coach/workout/squat", label: "Workout" },
  { href: "/coach/progress", label: "Progress" }
];

export function CoachShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { averageScore, currentStreak, isHydrated, profile, resetData, sessions } =
    useAppState();

  const profileSnapshot = profile
    ? `${profile.motivation.length} motivation signal${profile.motivation.length > 1 ? "s" : ""} • ${profile.movementPreferences.length} preferred movement lane${profile.movementPreferences.length > 1 ? "s" : ""}`
    : "Complete onboarding to tailor your starter plan.";

  return (
    <div className="relative min-h-screen pb-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <BrandMark />
              <div>
                <p className="eyebrow">VisCoach</p>
                <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                  A form coach in your pocket.
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-lime text-ink"
                          : "border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[430px]">
              <div className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                  Live streak
                </p>
                <p className="mt-3 font-display text-3xl font-semibold text-white">
                  {isHydrated ? currentStreak : "--"}
                </p>
                <p className="mt-2 text-xs text-mist/60">Consecutive active days</p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                  Avg. form
                </p>
                <p className="mt-3 font-display text-3xl font-semibold text-white">
                  {isHydrated && sessions.length ? `${averageScore}%` : "--"}
                </p>
                <p className="mt-2 text-xs text-mist/60">Across saved sessions</p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                  Profile
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  {profile ? "Ready" : "Pending"}
                </p>
                <button
                  type="button"
                  onClick={resetData}
                  className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime"
                >
                  Reset data
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-mist/70">
            {profileSnapshot}
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
