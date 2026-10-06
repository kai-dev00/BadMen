import { Stack } from "expo-router";
// @ts-ignore: side-effect import for global CSS
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "../src//database/migrations";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { NAV_THEME, THEME } from "@/lib/theme";
import { useThemeBootstrap } from "@/src/hooks/useTheme";

export default function RootLayout() {
  const ready = useThemeBootstrap();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";

  // Wait for the saved preference so users don't see a flash of the wrong theme.
  if (!ready) return null;

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName="badmen.db" onInit={migrateDbIfNeeded}>
          <SafeAreaProvider>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: THEME[scheme].background },
              }}
            />
            <PortalHost />
          </SafeAreaProvider>
        </SQLiteProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
