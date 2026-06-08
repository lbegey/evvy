"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const STORAGE_KEY = "minical_tz";

interface TimezoneContextValue {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  timezone: "UTC",
  setTimezone: () => {},
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTimezoneState(stored);
  }, []);

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem(STORAGE_KEY, tz);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => useContext(TimezoneContext);
