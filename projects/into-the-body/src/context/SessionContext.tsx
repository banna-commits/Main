import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionState {
  currentStep: number;
  selectedZone: string | null;
  sensation: string | null;
  emotion: string | null;
  emotionText: string;
  currentDay: number;
}

interface SessionContextType extends SessionState {
  setStep: (step: number) => void;
  nextStep: () => void;
  setSelectedZone: (zone: string | null) => void;
  setSensation: (s: string | null) => void;
  setEmotion: (e: string | null) => void;
  setEmotionText: (t: string) => void;
  setCurrentDay: (d: number) => void;
  reset: () => void;
}

const initial: SessionState = {
  currentStep: 0,
  selectedZone: null,
  sensation: null,
  emotion: null,
  emotionText: '',
  currentDay: 1,
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);

  const ctx: SessionContextType = {
    ...state,
    setStep: (step) => setState((s) => ({ ...s, currentStep: step })),
    nextStep: () => setState((s) => ({ ...s, currentStep: s.currentStep + 1 })),
    setSelectedZone: (zone) => setState((s) => ({ ...s, selectedZone: zone })),
    setSensation: (sensation) => setState((s) => ({ ...s, sensation })),
    setEmotion: (emotion) => setState((s) => ({ ...s, emotion })),
    setEmotionText: (emotionText) => setState((s) => ({ ...s, emotionText })),
    setCurrentDay: (currentDay) => setState((s) => ({ ...s, currentDay })),
    reset: () => setState({ ...initial, currentDay: state.currentDay }),
  };

  return <SessionContext.Provider value={ctx}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}
