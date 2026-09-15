import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuickForm } from "./components/QuickForm";
import { useQuickMatches } from "./hooks/useQuickMatches";
import type { CreateQuickMatch as FormQuickMatch } from "./types/quickSchema";
import Header from "../common/header";

export default function EditQuickMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, isLoading, update } = useQuickMatches();
  const [initialValues, setInitialValues] = useState<FormQuickMatch | null>(null);
  const match = matches.find((item) => String(item.id) === id);

  useEffect(() => {
    if (!match) return;

    setInitialValues({
      matchType: match.matchType,
      bestOf: match.bestOf,
      scoring: match.scoring,
      player1: match.matchType === "singles" ? match.teamA[0] ?? "" : "",
      player2: match.matchType === "singles" ? match.teamB[0] ?? "" : "",
      teamAName: match.teamAName,
      teamAPlayer1: match.teamA[0] ?? "",
      teamAPlayer2: match.teamA[1] ?? "",
      teamBName: match.teamBName,
      teamBPlayer1: match.teamB[0] ?? "",
      teamBPlayer2: match.teamB[1] ?? "",
    });
  }, [match?.id]);

  async function handleUpdate(data: FormQuickMatch) {
    if (!match) return;
    await update({ id: match.id, data });
    router.replace(`/quick/${match.id}`);
  }

  if (isLoading || !initialValues) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">
          {isLoading ? "Loading match..." : "Match not found."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <Header title="Edit Quick Match" showBack onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <QuickForm onSubmit={handleUpdate} defaultValues={initialValues} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
