import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import Header from "../common/header";
import { TournamentForm } from "./components/TournamentForm";
import { TournamentValues } from "./types/tournamentSchema";
import { useTournaments } from "./hooks/useTournaments";

export default function AddTournamentScreen() {
  const { create, generateBracket } = useTournaments();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleCreate(data: TournamentValues) {
    const tournamentId = await create({ ...data });

    try {
      await generateBracket(tournamentId);
    } catch (error) {
      console.error(error);
    }

    router.replace(`/tournament/${tournamentId}`);
  }


  if (isGenerating) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Generating Bracket...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <Header title="Add Tournament" showBack onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 p-5 pb-20">
          <TournamentForm onSubmit={handleCreate} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}