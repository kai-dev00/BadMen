import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTournaments } from "./hooks/useTournaments";
import { TournamentValues } from "./types/tournamentSchema";
import Header from "../common/header";
import { TournamentForm } from "./components/TournamentForm";



export default function EditTournamentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, isLoading, update } = useTournaments();
  const [initialValues, setInitialValues] = useState<TournamentValues | null>(null);
  const tournament = tournaments.find((item) => String(item.id) === id);

  useEffect(() => {
    if (!tournament) return;

    setInitialValues({
      name: tournament.name,
      matchType: tournament.matchType,
      format: tournament.format,
      bestOf: tournament.bestOf,
      scoring: tournament.scoring,
      players: tournament.players.map((player) => player.name),
    });
  }, [tournament?.id]);

  async function handleUpdate(data: TournamentValues) {
    if (!tournament) return;
    await update({ id: tournament.id, data });
    router.replace(`/tournament/${tournament.id}`);
  }

  if (isLoading || !initialValues) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">
          {isLoading ? "Loading tournament..." : "Tournament not found."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <Header title="Edit Tournament" showBack onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 p-5 pb-20">
          <TournamentForm onSubmit={handleUpdate} defaultValues={initialValues} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}