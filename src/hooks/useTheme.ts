// src/hooks/useTheme.ts
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "color-scheme-preference";
const CYCLE: ThemePreference[] = ["light", "dark", "system"];

function isPreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Call ONCE in the root layout. Restores the saved preference and reports
 * when it has been applied, so the app can avoid flashing the wrong theme.
 */
export function useThemeBootstrap() {
  const { setColorScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && isPreference(saved)) setColorScheme(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [setColorScheme]);

  return ready;
}

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isPreference(saved)) setPreferenceState(saved);
      })
      .catch(() => {});
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      setColorScheme(next);
      void AsyncStorage.setItem(STORAGE_KEY, next);
    },
    [setColorScheme],
  );

  const cycle = useCallback(() => {
    setPreference(CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length]);
  }, [preference, setPreference]);

  return {
    preference,
    colorScheme,
    isDark: colorScheme === "dark",
    setPreference,
    cycle,
  };
}
