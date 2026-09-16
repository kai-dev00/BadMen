import { useMemo, useState } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../common/header";
import { cn } from "@/lib/utils";
import { useBracket, useStandings, useTournament } from "./hooks/useTournaments";
import { Bracket, BracketMatch, BracketTeam, StandingsRow } from "../../database/repositories/TournamentRepository";
import StandingsTable, { StandingsColumn } from "./components/StandingTable";

type Tab = "bracket" | "standings";

// type StandingsRow = {
//   teamId: number;
//   name: string;
//   wins: number;
//   losses: number;
//   ties: number;
//   played: number;
// };

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = id ? Number(id) : undefined;

  const { data: tournament, isLoading: isLoadingTournament } = useTournament(tournamentId);
  const { data: bracket, isLoading: isLoadingBracket } = useBracket(tournamentId);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("bracket");

  // const standings = useMemo(() => (bracket ? buildStandings(bracket) : []), [bracket]);
  const { data: standings = [] } = useStandings(tournamentId);

  // const standingsColumns: StandingsColumn<StandingsRow>[] = [
  //   {
  //     key: "record",
  //     label: "W-L-T",
  //     align: "right",
  //     width: 96,
  //     render: (row) => `${row.wins} - ${row.losses} - ${row.ties}`,
  //   },
  // ];
  const standingsColumns: StandingsColumn<StandingsRow>[] = [
    {
      key: "record",
      label: "W-L-T",
      align: "right",
      width: 80,
      render: (row) => `${row.wins}-${row.losses}-${row.ties}`,
    },
    {
      key: "diff",
      label: "Diff",
      align: "right",
      width: 56,
      render: (row) => (row.pointDiff > 0 ? `+${row.pointDiff}` : `${row.pointDiff}`),
    },
  ];

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
  const hasBracket = Boolean(bracket && bracket.rounds.length > 0);

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

      {tournament.status === "concluded" && standings.length > 0 && (
        <View className="border-b border-border bg-muted px-5 py-3">
          <Text className="text-center text-sm text-muted-foreground">Tournament complete</Text>
          <Text className="text-center text-base font-semibold text-foreground">
            {standings[0].name} wins
          </Text>
        </View>
      )}

      {hasBracket && (
        <View className="flex-row border-b border-border">
          <TabButton label="Bracket" active={activeTab === "bracket"} onPress={() => setActiveTab("bracket")} />
          <TabButton label="Standings" active={activeTab === "standings"} onPress={() => setActiveTab("standings")} />
        </View>
      )}

      {!hasBracket ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-muted-foreground">
            No bracket generated yet for this tournament.
          </Text>
        </View>
      ) : activeTab === "bracket" ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
          {bracket!.rounds.map((matches, index) => (
            <RoundSection key={index} roundNumber={index + 1} matches={matches} />
          ))}
        </ScrollView>
      ) : (
        <StandingsTable
          rows={standings}
          columns={standingsColumns}
          keyExtractor={(row) => row.teamId}
          labelColumn={(row) => row.name}
        />
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center py-3">
      <Text className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </Text>
      {active && <View className="mt-2 h-0.5 w-10 rounded-full bg-foreground" />}
    </Pressable>
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
  const canScore = Boolean(match.sideA && match.sideB);
  const scoreLabel =
    match.status === "upcoming" && match.teamASets === 0 && match.teamBSets === 0
      ? "vs"
      : `${match.teamASets} - ${match.teamBSets}`;

  return (
    <Pressable
      disabled={!canScore}
      onPress={() => router.push(`/tournament/match/${match.id}`)}
      className="flex-row items-center justify-between rounded-md border border-border px-3 py-3"
    >
      <Text className="flex-1 text-sm text-foreground">{match.sideA?.name ?? "TBD"}</Text>
      <Text className="mx-2 text-xs text-muted-foreground">{scoreLabel}</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{match.sideB?.name ?? "TBD"}</Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Standings                                                                   */
/* -------------------------------------------------------------------------- */

// function buildStandings(bracket: Bracket): StandingsRow[] {
//   const rows = new Map<number, StandingsRow>();

//   function ensureTeam(team: BracketTeam | null) {
//     if (!team || rows.has(team.id)) return;
//     rows.set(team.id, { teamId: team.id, name: team.name, wins: 0, losses: 0, ties: 0, played: 0 });
//   }

//   for (const round of bracket.rounds) {
//     for (const match of round) {
//       ensureTeam(match.sideA);
//       ensureTeam(match.sideB);

//       if (match.status !== "concluded" || !match.sideA || !match.sideB) continue;

//       const teamA = rows.get(match.sideA.id)!;
//       const teamB = rows.get(match.sideB.id)!;
//       teamA.played += 1;
//       teamB.played += 1;

//       if (match.winnerTeamId === match.sideA.id) {
//         teamA.wins += 1;
//         teamB.losses += 1;
//       } else if (match.winnerTeamId === match.sideB.id) {
//         teamB.wins += 1;
//         teamA.losses += 1;
//       } else {
//         teamA.ties += 1;
//         teamB.ties += 1;
//       }
//     }
//   }

//   return Array.from(rows.values()).sort((a, b) => b.wins - a.wins || b.played - a.played);
// }

