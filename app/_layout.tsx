import { Stack } from "expo-router";
// @ts-ignore: side-effect import for global CSS
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "../src//database/migrations";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName="badmen.db" onInit={migrateDbIfNeeded}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </SafeAreaProvider>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
