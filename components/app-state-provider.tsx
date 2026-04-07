"use client";

import {
  averageFormScore,
  calculateCurrentStreak,
  loadStoredValue,
  mostCommonCorrectionFromSessions,
  removeStoredValue,
  saveStoredValue,
  STORAGE_KEYS,
  totalReps
} from "@/lib/storage";
import {
  OnboardingProfile,
  SessionSummary
} from "@/types/viscoach";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

interface AppStateValue {
  isHydrated: boolean;
  profile: OnboardingProfile | null;
  sessions: SessionSummary[];
  currentStreak: number;
  averageScore: number;
  totalRepCount: number;
  mostCommonCorrection: string;
  completeOnboarding: (
    profile: Omit<OnboardingProfile, "completedAt">
  ) => void;
  saveSession: (session: SessionSummary) => void;
  resetData: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    setProfile(loadStoredValue(STORAGE_KEYS.profile, null));
    setSessions(loadStoredValue(STORAGE_KEYS.sessions, []));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveStoredValue(STORAGE_KEYS.profile, profile);
  }, [isHydrated, profile]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveStoredValue(STORAGE_KEYS.sessions, sessions);
  }, [isHydrated, sessions]);

  const value: AppStateValue = {
    isHydrated,
    profile,
    sessions,
    currentStreak: calculateCurrentStreak(sessions),
    averageScore: averageFormScore(sessions),
    totalRepCount: totalReps(sessions),
    mostCommonCorrection: mostCommonCorrectionFromSessions(sessions),
    completeOnboarding(nextProfile) {
      setProfile({
        ...nextProfile,
        completedAt: new Date().toISOString()
      });
    },
    saveSession(session) {
      setSessions((currentSessions) => [session, ...currentSessions].slice(0, 32));
    },
    resetData() {
      removeStoredValue(STORAGE_KEYS.profile);
      removeStoredValue(STORAGE_KEYS.sessions);
      setProfile(null);
      setSessions([]);
    }
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);

  if (!value) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return value;
}
