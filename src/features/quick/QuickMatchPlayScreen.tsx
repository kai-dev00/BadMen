import { Minus, Pencil, Plus } from "lucide-react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuickMatchSet } from "../../database/repositories/QuickMatchRepository";
import { useQuickMatches } from "./hooks/useQuickMatches";

type Side = "A" | "B";

type Score = {
  A: number;
  B: number;
};

export default function QuickMatchPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    matches,
    isLoading,
    updateStatus,
    updateSetScore,
    recordSetScore,
    rematch,
  } = useQuickMatches();
  const [score, setScore] = useState<Score>({ A: 0, B: 0 });
  const [setsWon, setSetsWon] = useState<Score>({ A: 0, B: 0 });
  const [setNumber, setSetNumber] = useState(1);
  const [setHistory, setSetHistory] = useState<QuickMatchSet[]>([]);
  const [lastSetResult, setLastSetResult] = useState<{
    winner: Side;
    score: Score;
  } | null>(null);

  const match = matches.find((item) => String(item.id) === id);

  useEffect(() => {
    if (!match) return;

    const history = match.sets;
    setSetHistory(history);
    setSetsWon({
      A: history.filter((set) => set.teamAScore > set.teamBScore).length,
      B: history.filter((set) => set.teamBScore > set.teamAScore).length,
    });
    setSetNumber(history.length + 1);
  }, [match?.id]);

  function changeScore(side: Side, amount: number) {
    setLastSetResult(null);
    setScore((current) => ({
      ...current,
      [side]: Math.max(0, current[side] + amount),
    }));
  }

  function resetSet() {
    setLastSetResult(null);
    setScore({ A: 0, B: 0 });
  }

  async function endSet() {
    if (!match || match.status === "concluded") return;

    const deuceStartsAt = Math.max(1, match.scoring - 1);
    const isDeuce =
      score.A >= deuceStartsAt && score.B >= deuceStartsAt;

    if (isDeuce && Math.abs(score.A - score.B) < 2) {
      Alert.alert(
        "Deuce",
        "A side must lead by 2 points before ending the set.",
      );
      return;
    }

    if (score.A < match.scoring && score.B < match.scoring) {
      Alert.alert(
        "Set is not finished",
        `One side must reach ${match.scoring} points before ending the set.`,
      );
      return;
    }

    if (score.A === score.B) {
      Alert.alert("Set is tied", "One side must be ahead before ending the set.");
      return;
    }

    const winner: Side = score.A > score.B ? "A" : "B";
    const nextSetsWon = {
      ...setsWon,
      [winner]: setsWon[winner] + 1,
    };
    const completedSet = {
      setNumber,
      teamAScore: score.A,
      teamBScore: score.B,
    };

    await recordSetScore({
      id: match.id,
      ...completedSet,
    });

    setSetHistory((current) => [...current, completedSet]);
    setLastSetResult({
      winner,
      score: { A: score.A, B: score.B },
    });
    setSetsWon(nextSetsWon);
    setScore({ A: 0, B: 0 });

    await updateSetScore({
      id: match.id,
      teamASets: nextSetsWon.A,
      teamBSets: nextSetsWon.B,
    });

    if (nextSetsWon[winner] >= match.bestOf) {
      await updateStatus({ id: match.id, status: "concluded" });
      Alert.alert(
        "Match complete",
        `${winner === "A" ? getSideName("A") : getSideName("B")} wins the match.`,
      );
      return;
    }

    setSetNumber((current) => current + 1);
    await updateStatus({ id: match.id, status: "ongoing" });
  }

  function getSideName(side: Side) {
    if (!match) return side;
    return match.matchType === "doubles"
      ? side === "A"
        ? match.teamAName
        : match.teamBName
      : side === "A"
        ? match.teamA[0]
        : match.teamB[0];
  }

  function getSidePlayers(side: Side) {
    if (!match || match.matchType === "singles") return "";
    return (side === "A" ? match.teamA : match.teamB).join(" / ");
  }

  function getSetWinner(set: QuickMatchSet) {
    return set.teamAScore > set.teamBScore
      ? getSideName("A")
      : getSideName("B");
  }

  function getCurrentWinner(): Side | null {
    if (!match || score.A === score.B) return null;

    const deuceStartsAt = Math.max(1, match.scoring - 1);
    const isDeuce =
      score.A >= deuceStartsAt && score.B >= deuceStartsAt;

    if (isDeuce && Math.abs(score.A - score.B) < 2) {
      return null;
    }

    if (score.A >= match.scoring || score.B >= match.scoring) {
      return score.A > score.B ? "A" : "B";
    }

    return null;
  }

  async function startRematch() {
    if (!match) return;

    const rematchId = await rematch(match.id);
    router.replace(`/quick/${rematchId}`);
  }

  if (isLoading || !match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fafafa]">
        <Text className="text-muted-foreground">
          {isLoading ? "Loading match..." : "Match not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const currentWinner = getCurrentWinner();
  const highlightedWinner = currentWinner ?? lastSetResult?.winner;

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <Stack.Screen
        options={{
          headerRight: () =>
            match.status === "upcoming" ? (
              <Pressable
                onPress={() => router.push(`/quick/edit/${match.id}`)}
                accessibilityLabel="Edit match"
                hitSlop={8}
              >
                <Pencil size={20} color="#1a1a1a" />
              </Pressable>
            ) : null,
        }}
      />
      <View className="flex-1 px-5">
        <View className="border border-[#1a1a1a] bg-white p-3 mt-8">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-base font-semibold text-[#1a1a1a]">
                {getSideName("A")} ({match.teamASets})
              </Text>
              {getSidePlayers("A") && (
                <Text className="mt-0.5 text-xs text-[#6b6b6b]">
                  {getSidePlayers("A")}
                </Text>
              )}
            </View>
            <Text className="pt-0.5 text-xs font-medium text-[#8a8a8a]">
              BO{match.bestOf}
            </Text>
            <View className="flex-1 items-end pl-3">
              <Text className="text-right text-base font-semibold text-[#1a1a1a]">
                {getSideName("B")} ({match.teamBSets})
              </Text>
              {getSidePlayers("B") && (
                <Text className="mt-0.5 text-right text-xs text-[#6b6b6b]">
                  {getSidePlayers("B")}
                </Text>
              )}
            </View>
          </View>
          <Text className="mt-1 text-xs capitalize text-[#8a8a8a]">
            {match.matchType} | {match.bestOf} sets | up to {match.scoring}
          </Text>
          {match.rematchNumber > 0 && (
            <Text className="mt-1 text-xs text-[#8a8a8a]">
              Rematch #{match.rematchNumber}
            </Text>
          )}
          <Text className="mt-1 text-xs text-[#8a8a8a]">
            {formatCreatedAt(match.createdAt)}
          </Text>
          {match.endedAt && (
            <Text className="mt-1 text-xs text-[#8a8a8a]">
              {formatCreatedAt(match.endedAt, "Ended")}
            </Text>
          )}
        </View>

        <Text className="my-6 text-center text-base font-medium text-[#1a1a1a]">
          {match.status === "concluded" ? "Match history" : `Set ${setNumber}`}
        </Text>

        {match.status !== "concluded" &&
          score.A >= Math.max(1, match.scoring - 1) &&
          score.B >= Math.max(1, match.scoring - 1) &&
          Math.abs(score.A - score.B) < 2 && (
            <Text className="mb-4 text-center text-sm font-medium text-[#b42318]">
              Deuce - win by 2 points
            </Text>
          )}

        {match.status === "concluded" ? (
          <View className="gap-3">
            {setHistory.map((set) => (
              <View
                key={set.setNumber}
                className="flex-row items-center justify-between border border-[#1a1a1a] bg-white px-4 py-3"
              >
                <Text className="text-sm text-[#1a1a1a]">
                  Set {set.setNumber}
                </Text>
                <Text className="text-base font-medium text-[#1a1a1a]">
                  {set.teamAScore} - {set.teamBScore}
                </Text>
                <Text className="text-xs font-medium text-green-700">
                  {getSetWinner(set)} wins
                </Text>
              </View>
            ))}
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              Match concluded. Scoring is disabled.
            </Text>
            <Button className="mt-4" variant="outline" onPress={startRematch}>
              <Text>Rematch</Text>
            </Button>
          </View>
        ) : (
          <>
            <View className="flex-row gap-5">
              {(["A", "B"] as Side[]).map((side) => (
                <View
                  key={side}
                  className={cn(
                    "flex-1 border bg-white p-3",
                    highlightedWinner === side
                      ? "border-green-600 bg-green-50"
                      : highlightedWinner && "border-red-600 bg-red-50",
                    !highlightedWinner && "border-[#1a1a1a]",
                  )}
                >
                  <Text className="text-center text-xl font-medium text-[#1a1a1a]">
                    {score[side]}
                  </Text>
                  <Text className="mt-1 text-center text-sm font-medium text-[#1a1a1a]">
                    {getSideName(side)}
                  </Text>
                  {getSidePlayers(side) && (
                    <Text className="mt-0.5 text-center text-xs text-[#6b6b6b]">
                      {getSidePlayers(side)}
                    </Text>
                  )}
                  <Text className="mt-1 text-center text-xs text-[#8a8a8a]">
                    Sets won: {setsWon[side]}
                  </Text>
                  {currentWinner && (
                    <Text className="mt-2 text-center text-xs font-medium text-green-700">
                      Ready to end set
                    </Text>
                  )}
                  {lastSetResult && !currentWinner && (
                    <Text
                      className={cn(
                        "mt-2 text-center text-xs font-medium",
                        lastSetResult.winner === side
                          ? "text-green-700"
                          : "text-red-700",
                      )}
                    >
                      {lastSetResult.winner === side ? "Set won" : "Set lost"} ({lastSetResult.score[side]})
                    </Text>
                  )}

                  <View className="mt-4 flex-row justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => changeScore(side, -1)}
                      accessibilityLabel={`Subtract point from ${getSideName(side)}`}
                    >
                      <Minus size={18} color="#1a1a1a" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => changeScore(side, 1)}
                      accessibilityLabel={`Add point to ${getSideName(side)}`}
                    >
                      <Plus size={18} color="#1a1a1a" />
                    </Button>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-12 flex-row items-center justify-between">
              <Button variant="ghost" onPress={resetSet}>
                <Text>Reset</Text>
              </Button>
              <Button variant="outline" onPress={endSet}>
                <Text>End Set {setNumber}</Text>
              </Button>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatCreatedAt(value: string, prefix = "Created") {
  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(
    normalizedValue.endsWith("Z") ? normalizedValue : `${normalizedValue}Z`,
  );

  if (Number.isNaN(date.getTime())) return `${prefix} ${value}`;

  return `${prefix} ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}
