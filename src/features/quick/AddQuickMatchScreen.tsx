import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";

import { QuickForm } from "./components/QuickForm";
import { CreateQuickMatch } from "./types/quickSchema";
import { useQuickMatches } from "./hooks/useQuickMatches";
import Header from "../common/header";

export default function AddQuickMatchScreen() {

  const { create } = useQuickMatches();

  async function handleCreate(data: CreateQuickMatch) {
    console.log(data);
    const matchId = await create(data);
    router.replace(`/quick/${matchId}`);
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "bottom"]}
    >
      <Header title="Add Quick Match" showBack onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <QuickForm onSubmit={handleCreate} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}