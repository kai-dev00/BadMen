import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

/**
 * JS mirror of the tokens in global.css, for APIs that can't take a className
 * (navigation theme, tab bar, status bar). Keep in sync with global.css —
 * do NOT introduce colors here that don't exist there.
 */
export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 3.9%)",
    primary: "hsl(85 100% 71%)",
    primaryForeground: "hsl(0 0% 9%)",
    secondary: "hsl(0 0% 96.1%)",
    secondaryForeground: "hsl(0 0% 9%)",
    muted: "hsl(0 0% 94.9%)",
    mutedForeground: "hsl(0 0% 45.1%)",
    accent: "hsl(85 100% 71%)",
    accentForeground: "hsl(0 0% 9%)",
    destructive: "hsl(1 100% 59%)",
    destructiveForeground: "hsl(0 0% 98%)",
    success: "hsl(131 85% 49%)",
    successForeground: "hsl(0 0% 9%)",
    warning: "hsl(42 88% 52%)",
    warningForeground: "hsl(0 0% 9%)",
    info: "hsl(203 93% 57%)",
    infoForeground: "hsl(0 0% 98%)",
    border: "hsl(0 0% 89.4%)",
    input: "hsl(0 0% 89.4%)",
    ring: "hsl(0 0% 63%)",
    tonalSurface: "hsl(92 37% 92%)",
    tonalSurface2: "hsl(117 100% 97%)",
  },
  dark: {
    background: "hsl(0 0% 7.1%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(0 0% 14.5%)",
    cardForeground: "hsl(0 0% 98%)",
    popover: "hsl(0 0% 14.5%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(85 100% 71%)",
    primaryForeground: "hsl(0 0% 9%)",
    secondary: "hsl(0 0% 22.4%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(0 0% 22.4%)",
    mutedForeground: "hsl(0 0% 63.9%)",
    accent: "hsl(85 100% 71%)",
    accentForeground: "hsl(0 0% 9%)",
    destructive: "hsl(1 100% 59%)",
    destructiveForeground: "hsl(0 0% 98%)",
    success: "hsl(131 85% 49%)",
    successForeground: "hsl(0 0% 9%)",
    warning: "hsl(42 88% 52%)",
    warningForeground: "hsl(0 0% 9%)",
    info: "hsl(203 93% 57%)",
    infoForeground: "hsl(0 0% 98%)",
    border: "hsl(0 0% 22.4%)",
    input: "hsl(0 0% 22.4%)",
    ring: "hsl(300 0% 45%)",
    tonalSurface: "hsl(87 11% 19%)",
    tonalSurface2: "hsl(90 19% 12%)",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.foreground,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.foreground,
      text: THEME.dark.foreground,
    },
  },
};
