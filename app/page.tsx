"use client";

import { useAppState } from "@/components/app-state-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();
  const { isHydrated, profile } = useAppState();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    router.replace(profile ? "/coach/library" : "/onboarding");
  }, [isHydrated, profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-lg p-8 text-center">
        <p className="eyebrow">VisCoach</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          Preparing the MVP flow.
        </h1>
      </div>
    </div>
  );
}
