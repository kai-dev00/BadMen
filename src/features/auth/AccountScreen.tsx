import { useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CloudOff, RefreshCw, UserRound } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/src/auth/AuthProvider";
import { useSync, type SyncStatus } from "@/src/sync/SyncProvider";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { formatListDate } from "../common/dates";
import Header from "../common/header";
import { FormError } from "./components/AuthScreenLayout";

function syncLabel(status: SyncStatus, pending: number) {
  if (status === "syncing") return "Syncing…";
  if (status === "offline") return "Offline. Changes will sync when you're back online.";
  if (status === "error") return "Last sync failed.";
  if (pending > 0) return `${pending} change${pending === 1 ? "" : "s"} waiting to sync.`;
  return status === "synced" ? "Everything is backed up." : "Waiting to sync.";
}

export default function AccountScreen() {
  const { user, isLoading, isConfigured, signOut } = useAuth();
  const { primaryForeground, mutedForeground, foreground } = useThemeColors();
  const { status, error: syncError, lastSyncedAt, pending, syncNow } = useSync();
  const [error, setError] = useState<string | null>(null);

  function confirmSignOut() {
    Alert.alert(
      "Sign out?",
      "Your matches stay on this device. They'll sync again when you sign back in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            const result = await signOut();
            if (result.error) setError(result.error);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="Profile" />

      <View className="gap-4 px-4 pt-2">
        {isLoading ? null : user ? (
          <>
            <Card className="flex-row items-center gap-3 p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                <UserRound size={22} color={primaryForeground} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Signed in
                </Text>
                <Text className="text-base font-semibold" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </Card>

            <Card className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold">Sync</Text>
                {lastSyncedAt ? (
                  <Text className="text-xs text-muted-foreground">
                    Last synced {formatListDate(lastSyncedAt)}
                  </Text>
                ) : null}
              </View>
              <Text className="text-sm text-muted-foreground">{syncLabel(status, pending)}</Text>
              <FormError message={status === "error" ? syncError : null} />
              <Button
                variant="outline"
                className="h-10"
                disabled={status === "syncing"}
                onPress={() => void syncNow()}
              >
                <RefreshCw size={16} color={foreground} />
                <Text className="font-bold">Sync now</Text>
              </Button>
            </Card>

            <FormError message={error} />

            <Button variant="outline" className="h-11" onPress={confirmSignOut}>
              <Text className="font-bold">Sign out</Text>
            </Button>
          </>
        ) : (
          <>
            <Card className="items-center gap-2 p-5">
              <CloudOff size={28} color={mutedForeground} />
              <Text className="text-base font-semibold">You're not signed in</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {isConfigured
                  ? "Your matches are saved on this device only. Sign in to back them up and sync across devices."
                  : "Online features aren't set up for this build. Your matches are saved on this device."}
              </Text>
            </Card>

            <Button
              className="h-11"
              disabled={!isConfigured}
              onPress={() => router.push("/auth/login")}
            >
              <Text className="font-bold">Sign in</Text>
            </Button>
            <Button
              variant="outline"
              className="h-11"
              disabled={!isConfigured}
              onPress={() => router.push("/auth/register")}
            >
              <Text className="font-bold">Create account</Text>
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
