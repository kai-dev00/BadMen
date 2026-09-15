// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

// import { TournamentForm } from "./components/TournamentForm";
// import { TournamentValues } from "./types/tournamentSchema";
// import { useTournaments } from "./hooks/useTournaments";
// import Header from "../common/header";

// export default function AddTournamentScreen() {
//   const { create } = useTournaments();

//   async function handleCreate(data: TournamentValues) {
//     const tournamentId = await create({
//       name: data.name,
//       matchType: data.matchType,
//       format: data.format,
//       bestOf: data.bestOf,
//       scoring: data.scoring,
//       players: data.players,
//     });
//     // router.replace(`/play/${tournamentId}`);
//     router.replace("/tournament");
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
//       <Header title="Add Tournament" showBack onBackPress={() => router.back()} />
//       <KeyboardAvoidingView
//         className="flex-1"
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <ScrollView
//           className="flex-1"
//           contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           <TournamentForm onSubmit={handleCreate} />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }
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

  // async function handleCreate(data: TournamentValues) {
  //   const tournamentId = await create({
  //     name: data.name,
  //     matchType: data.matchType,
  //     format: data.format,
  //     bestOf: data.bestOf,
  //     scoring: data.scoring,
  //     players: data.players,
  //   });

  //   setIsGenerating(true);
  //   try {
  //     await generateBracket(tournamentId);
  //     router.replace(`/tournament/${tournamentId}`);
  //   } catch (error) {
  //     // Bracket generation failed (e.g. format not yet supported) — the
  //     // tournament still exists, just without matches. Land on the list
  //     // for now rather than a broken detail screen.
  //     console.error(error);
  //     router.replace("/tournament");
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // }

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