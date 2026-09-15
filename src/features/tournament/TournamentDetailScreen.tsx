// import { useLocalSearchParams, router, Stack } from "expo-router";
// import { ScrollView, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import Header from "../common/header";
// import { useBracket, useTournament } from "./hooks/useTournaments";
// import { BracketMatch } from "../../database/repositories/TournamentRepository";

// export default function TournamentDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const tournamentId = id ? Number(id) : undefined;

//   const { data: tournament, isLoading: isLoadingTournament } = useTournament(tournamentId);
//   const { data: bracket, isLoading: isLoadingBracket } = useBracket(tournamentId);

//   if (isLoadingTournament || isLoadingBracket) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center bg-background">
//         <Text className="text-muted-foreground">Loading...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!tournament) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center bg-background">
//         <Text className="text-muted-foreground">Tournament not found.</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
//       <Stack.Screen options={{ headerShown: false }} />
//       <Header title={tournament.name} showBack onBackPress={() => router.back()} />

//       {!bracket || bracket.rounds.length === 0 ? (
//         <View className="flex-1 items-center justify-center px-10">
//           <Text className="text-center text-muted-foreground">
//             No bracket generated yet for this tournament.
//           </Text>
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
//           {bracket.rounds.map((matches, index) => (
//             <RoundSection key={index} roundNumber={index + 1} matches={matches} />
//           ))}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// function RoundSection({
//   roundNumber,
//   matches,
// }: {
//   roundNumber: number;
//   matches: BracketMatch[];
// }) {
//   return (
//     <View className="gap-3">
//       <Text className="text-base font-semibold text-foreground">
//         Round {roundNumber}
//       </Text>
//       <View className="gap-2">
//         {matches.map((match) => (
//           <MatchRow key={match.id} match={match} />
//         ))}
//       </View>
//     </View>
//   );
// }

// function MatchRow({ match }: { match: BracketMatch }) {
//   return (
//     <View className="flex-row items-center justify-between rounded-md border border-border px-3 py-3">
//       <Text className="flex-1 text-sm text-foreground">
//         {match.sideA?.name ?? "TBD"}
//       </Text>
//       <Text className="mx-2 text-xs text-muted-foreground">vs</Text>
//       <Text className="flex-1 text-right text-sm text-foreground">
//         {match.sideB?.name ?? "TBD"}
//       </Text>
//     </View>
//   );
// }

import { useState } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../common/header";
import { useBracket, useTournament } from "./hooks/useTournaments";
import { BracketMatch } from "../../database/repositories/TournamentRepository";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = id ? Number(id) : undefined;

  const { data: tournament, isLoading: isLoadingTournament } = useTournament(tournamentId);
  const { data: bracket, isLoading: isLoadingBracket } = useBracket(tournamentId);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  function toggleTournamentOptions() {
    setIsOptionsOpen((current) => !current);
  }

  if (isLoadingTournament || isLoadingBracket) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Tournament not found.</Text>
      </SafeAreaView>
    );
  }

  const canEdit = tournament.status === "draft" || tournament.status === "upcoming";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={tournament.name}
        showBack
        onBackPress={() => router.back()}
        rightContent={canEdit ? <MoreVertical size={22} color="#1a1a1a" /> : null}
        onRightPress={toggleTournamentOptions}
      />
      {isOptionsOpen && (
        <View className="absolute right-5 top-20 z-50 min-w-[190px] bg-white p-1 shadow-md">
          {canEdit && (
            <Pressable
              className="px-3 py-3"
              onPress={() => {
                setIsOptionsOpen(false);
                router.push(`/tournament/edit/${tournament.id}`);
              }}
            >
              <Text className="text-sm text-[#1a1a1a]">Edit tournament</Text>
            </Pressable>
          )}
        </View>
      )}

      {!bracket || bracket.rounds.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-muted-foreground">
            No bracket generated yet for this tournament.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
          {bracket.rounds.map((matches, index) => (
            <RoundSection key={index} roundNumber={index + 1} matches={matches} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function RoundSection({ roundNumber, matches }: { roundNumber: number; matches: BracketMatch[] }) {
  return (
    <View className="gap-3">
      <Text className="text-base font-semibold text-foreground">Round {roundNumber}</Text>
      <View className="gap-2">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </View>
    </View>
  );
}

function MatchRow({ match }: { match: BracketMatch }) {
  return (
    <Pressable
      onPress={() => router.push(`/tournament/match/${match.id}`)}
      className="flex-row items-center justify-between rounded-md border border-border px-3 py-3"
    >
      <Text className="flex-1 text-sm text-foreground">{match.sideA?.name ?? "TBD"}</Text>
      <Text className="mx-2 text-xs text-muted-foreground">vs</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{match.sideB?.name ?? "TBD"}</Text>
    </Pressable>
  );
}