"use client";

import { useAppState } from "@/components/app-state-provider";
import {
  GoalId,
  MotivationId,
  MovementPreferenceId,
  StartTimingId
} from "@/types/viscoach";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const motivations: Array<{
  id: MotivationId;
  title: string;
  description: string;
}> = [
  {
    id: "start-routine",
    title: "Start a real routine",
    description: "Reduce the friction between good intentions and first sessions."
  },
  {
    id: "build-confidence",
    title: "Train with confidence",
    description: "Replace guesswork with clear camera-based feedback."
  },
  {
    id: "move-pain-free",
    title: "Move with less strain",
    description: "Prioritize form and joint-friendly cues while learning."
  },
  {
    id: "train-smarter",
    title: "Get faster feedback",
    description: "Use short coaching prompts instead of generic workout videos."
  }
];

const goals: Array<{ id: GoalId; title: string; description: string }> = [
  {
    id: "improve-form",
    title: "Improve form",
    description: "Nail the basics on each rep before adding complexity."
  },
  {
    id: "gain-strength",
    title: "Build strength",
    description: "Use cleaner mechanics so effort actually transfers."
  },
  {
    id: "stay-consistent",
    title: "Stay consistent",
    description: "Give yourself a repeatable starter loop you can sustain."
  },
  {
    id: "protect-joints",
    title: "Protect joints",
    description: "Catch avoidable breakdowns earlier in each movement."
  }
];

const movements: Array<{
  id: MovementPreferenceId;
  title: string;
  description: string;
}> = [
  {
    id: "bodyweight",
    title: "Bodyweight foundation",
    description: "Keep the MVP focused on basic movement quality."
  },
  {
    id: "strength",
    title: "Strength sessions",
    description: "Start with compound pushes and lower-body work."
  },
  {
    id: "mobility",
    title: "Mobility and control",
    description: "Emphasize range, stability, and cleaner positions."
  },
  {
    id: "hybrid",
    title: "Mixed training",
    description: "Blend bodyweight, strength, and mobility practice."
  }
];

const timings: Array<{
  id: StartTimingId;
  title: string;
  description: string;
}> = [
  {
    id: "today",
    title: "Right now",
    description: "Jump into the camera workout as soon as onboarding finishes."
  },
  {
    id: "this-week",
    title: "This week",
    description: "Explore the library first, then complete a guided session soon."
  },
  {
    id: "need-plan",
    title: "I need a starter plan",
    description: "Use the dashboard to decide what to do before the first workout."
  }
];

const onboardingSteps = [
  {
    label: "Intro",
    title: "Starter overview",
    description: "See the full path from setup to your first coached session."
  },
  {
    label: "Motivation",
    title: "Capture your motivation",
    description: "Choose the reasons that should shape your starter plan."
  },
  {
    label: "Goals",
    title: "Set your first-week focus",
    description: "Clarify what success should look like in the MVP."
  },
  {
    label: "Privacy",
    title: "Confirm privacy",
    description: "Review the browser-first camera and storage setup."
  },
  {
    label: "Movement",
    title: "Pick your movement lane",
    description: "Align the library and workout recommendations with your style."
  },
  {
    label: "Timing",
    title: "Choose your start pace",
    description: "Set the tone for how quickly you want to begin."
  }
] as const;

function ToggleCard({
  active,
  title,
  description,
  onClick
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border p-4 text-left transition ${
        active
          ? "border-lime bg-lime/[0.08] shadow-glow"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-mist/70">{description}</p>
        </div>
        <span
          className={`mt-1 h-4 w-4 rounded-full border ${
            active ? "border-lime bg-lime" : "border-white/[0.25]"
          }`}
        />
      </div>
    </button>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { completeOnboarding, isHydrated, profile } = useAppState();
  const [step, setStep] = useState(0);
  const [selectedMotivations, setSelectedMotivations] = useState<MotivationId[]>(
    []
  );
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [selectedMovements, setSelectedMovements] = useState<
    MovementPreferenceId[]
  >([]);
  const [startTiming, setStartTiming] = useState<StartTimingId | null>(null);

  useEffect(() => {
    if (!isHydrated || !profile) {
      return;
    }

    setSelectedMotivations(profile.motivation);
    setSelectedGoals(profile.goals);
    setPrivacyAccepted(profile.privacyAccepted);
    setSelectedMovements(profile.movementPreferences);
    setStartTiming(profile.startTiming);
  }, [isHydrated, profile]);

  function toggleSelection<T extends string>(current: T[], value: T) {
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  }

  const totalSteps = onboardingSteps.length;
  const currentStep = onboardingSteps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = [
    true,
    selectedMotivations.length > 0,
    selectedGoals.length > 0,
    privacyAccepted,
    selectedMovements.length > 0,
    startTiming !== null
  ][step];

  function advance() {
    if (step === totalSteps - 1) {
      if (!startTiming) {
        return;
      }

      completeOnboarding({
        motivation: selectedMotivations,
        goals: selectedGoals,
        privacyAccepted,
        movementPreferences: selectedMovements,
        startTiming
      });
      router.push("/coach/library");
      return;
    }

    setStep((currentStep) => currentStep + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <section className="panel relative w-full overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-lime/15 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="eyebrow">Onboarding</p>
                <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
                  Build your starter coaching loop.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-mist/75">
                  Move from setup to first workout in a short, guided flow.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-mist/60">
                Step {step + 1} / {totalSteps}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                    Progress
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                    {currentStep.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-mist/70">
                    {currentStep.description}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white">
                  {Math.round(progress)}% complete
                </div>
              </div>

              <div className="mt-5 progress-track h-3">
                <div
                  className="progress-fill transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {onboardingSteps.map((progressStep, index) => {
                  const isCurrent = index === step;
                  const isComplete = index < step;
                  const isActive = isCurrent || isComplete;

                  return (
                    <div key={progressStep.label} className="space-y-2">
                      <div
                        className={`h-1 rounded-full transition ${
                          isActive ? "bg-lime" : "bg-white/[0.08]"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                            isActive ? "text-lime" : "text-mist/40"
                          }`}
                        >
                          0{index + 1}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            isCurrent
                              ? "text-white"
                              : isComplete
                                ? "text-mist/80"
                                : "text-mist/50"
                          }`}
                        >
                          {progressStep.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {step === 0 ? (
              <div className="mt-4 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="panel-subtle flex min-h-[340px] flex-col justify-between overflow-hidden p-6">
                  <div>
                    <p className="chip">Your private AI form coach</p>
                    <h2 className="mt-5 font-display text-4xl font-semibold leading-none">
                      Start training with cues you can act on immediately.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-mist/75">
                      Answer a few quick prompts, confirm privacy, and head
                      straight into the exercise library or a first guided
                      session.
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-lime/20 bg-black/25 p-5">
                    <p className="text-sm leading-6 text-mist/75">
                      The MVP is intentionally tight: guided onboarding, three
                      supported exercises, a live pose overlay, and short coaching
                      prompts built for demo clarity.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    {
                      title: "Takes about a minute",
                      description:
                        "Six short steps, simple taps, and no account setup before the demo."
                    },
                    {
                      title: "Private by default",
                      description:
                        "Camera analysis stays in the browser and only lightweight choices are saved locally."
                    },
                    {
                      title: "Immediate next step",
                      description:
                        "Finish here and go straight to the library or your first camera-guided workout."
                    }
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={`rounded-[24px] border p-5 ${
                        index === 1
                          ? "border-lime/30 bg-lime/[0.08]"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
                        0{index + 1}
                      </p>
                      <p className="mt-3 font-display text-2xl font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-mist/70">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="mt-10 space-y-4">
                <div>
                  <p className="eyebrow">Motivation</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    What brings you to VisCoach?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-mist/75">
                    Pick the reasons that matter most. This shapes your starter
                    dashboard language and recommendations.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {motivations.map((motivation) => (
                    <ToggleCard
                      key={motivation.id}
                      active={selectedMotivations.includes(motivation.id)}
                      title={motivation.title}
                      description={motivation.description}
                      onClick={() =>
                        setSelectedMotivations((current) =>
                          toggleSelection(current, motivation.id)
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-10 space-y-4">
                <div>
                  <p className="eyebrow">Training goals</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    Unlock the right first-week focus.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-mist/75">
                    The original wireframe framed this as the value unlock. For
                    the MVP, it becomes the goals screen that steers the demo.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <ToggleCard
                      key={goal.id}
                      active={selectedGoals.includes(goal.id)}
                      title={goal.title}
                      description={goal.description}
                      onClick={() =>
                        setSelectedGoals((current) =>
                          toggleSelection(current, goal.id)
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <p className="eyebrow">Privacy</p>
                  <h2 className="font-display text-3xl font-semibold">
                    We take privacy seriously.
                  </h2>
                  <p className="text-sm leading-6 text-mist/75">
                    The demo stays browser-first. Camera access is local to your
                    session, and onboarding plus progress metrics live in
                    `localStorage` instead of a backend.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Pose estimation runs on-device in the browser.",
                      "No video is uploaded or persisted by this MVP.",
                      "Only profile choices and session summaries are saved locally."
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-mist/75"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyAccepted((current) => !current)}
                  className={`rounded-[28px] border p-6 text-left transition ${
                    privacyAccepted
                      ? "border-lime bg-lime/[0.08] shadow-glow"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="chip">Required</p>
                  <p className="mt-6 font-display text-3xl font-semibold">
                    {privacyAccepted ? "Accepted" : "Tap to accept"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-mist/70">
                    I understand that this MVP uses local browser camera access
                    and stores only lightweight profile and session data on this
                    device.
                  </p>
                </button>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-10 space-y-4">
                <div>
                  <p className="eyebrow">Movement type</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    What movements do you want to master first?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-mist/75">
                    This keeps the experience aligned with the exercise library
                    and camera workout recommendations.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {movements.map((movement) => (
                    <ToggleCard
                      key={movement.id}
                      active={selectedMovements.includes(movement.id)}
                      title={movement.title}
                      description={movement.description}
                      onClick={() =>
                        setSelectedMovements((current) =>
                          toggleSelection(current, movement.id)
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="mt-10 space-y-4">
                <div>
                  <p className="eyebrow">Start timing</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    When are you looking to start?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-mist/75">
                    Pick the pace that matches your first demo session.
                  </p>
                </div>
                <div className="grid gap-4">
                  {timings.map((timing) => (
                    <ToggleCard
                      key={timing.id}
                      active={startTiming === timing.id}
                      title={timing.title}
                      description={timing.description}
                      onClick={() => setStartTiming(timing.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
                disabled={step === 0}
                className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={advance}
                disabled={!canContinue}
                className="button-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {step === totalSteps - 1 ? "Start MVP" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
