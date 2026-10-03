import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Text,
  View,
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
        behavior="padding"
      >
        <View className="flex-1">
          <QuickForm onSubmit={handleCreate} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}