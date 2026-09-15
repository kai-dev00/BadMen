import {
  MoreVertical,
  Minimize,
  Minus,
  Plus,
} from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack, useLocalSearchParams, useNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import Header from "../common/header";
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
  const navigation = useNavigation();
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
  const [isLandscape, setIsLandscape] = useState(false);
  const [isChangingOrientation, setIsChangingOrientation] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    navigation.getParent()?.setOptions({
      tabBarStyle: isLandscape
        ? { display: "none", height: 0 }
        : undefined,
    });

    return () => {
      navigation.setOptions({
        headerShown: false,
      });
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [isLandscape, navigation]);

  useEffect(() => {
    if (match?.status !== "concluded" || !isLandscape) return;

    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT,
    ).then(() => setIsLandscape(false));
  }, [isLandscape, match?.status]);

  async function toggleLandscape() {
    setIsChangingOrientation(true);

    try {
      await ScreenOrientation.lockAsync(
        isLandscape
          ? ScreenOrientation.OrientationLock.PORTRAIT
          : ScreenOrientation.OrientationLock.LANDSCAPE,
      );
      setIsLandscape((current) => !current);
    } finally {
      setIsChangingOrientation(false);
    }
  }

  function toggleMatchOptions() {
    setIsOptionsOpen((current) => !current);
  }

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
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (isLandscape) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#fafafa]"
        edges={["top", "bottom"]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View className="m-1 flex-1 bg-white px-4 py-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-medium text-[#1a1a1a]">
                {match.status === "concluded" ? "History" : `Set ${setNumber}`} | {capitalize(match.matchType)}
              </Text>
            </View>
            {/* <Text className="text-base font-medium text-[#1a1a1a]">
              {match.status === "concluded" ? "History" : `Set ${setNumber}`}
            </Text> */}
            {match.status !== "concluded" && (
              <Pressable
                onPress={toggleLandscape}
                disabled={isChangingOrientation}
                accessibilityRole="button"
                accessibilityLabel="Use portrait mode"
                accessibilityState={{
                  busy: isChangingOrientation,
                  checked: true,
                }}
                hitSlop={8}
              >
                <Minimize size={22} color="#1a1a1a" />
              </Pressable>
            )}
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-xs capitalize text-[#8a8a8a]">
              {match.bestOf} sets | up to {match.scoring}
              {match.rematchNumber > 0 && ` | Rematch #${match.rematchNumber}`}
            </Text>
            <Text className="text-xs text-[#8a8a8a]">
              {formatCreatedAt(match.createdAt)}
              {match.endedAt && ` | ${formatCreatedAt(match.endedAt, "Ended")}`}
            </Text>
          </View>

          {match.status === "concluded" ? (
            <View className="mt-5 flex-1 justify-center gap-3">
              {setHistory.map((set) => (
                <View
                  key={set.setNumber}
                  className="flex-row items-center justify-between px-4 py-3"
                >
                  <Text className="text-sm text-[#1a1a1a]">
                    Set {set.setNumber}
                  </Text>
                  <Text className="text-xl font-medium text-[#1a1a1a]">
                    {set.teamAScore} - {set.teamBScore}
                  </Text>
                  <Text className="text-xs font-medium text-green-700">
                    {getSetWinner(set)} wins
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="mt-5 flex-1 flex-row gap-4">
              {(["A", "B"] as Side[]).map((side) => (
                <View
                  key={side}
                  className={cn(
                    "flex-1 items-center justify-center p-3",
                    highlightedWinner === side
                      ? "border-green-600 bg-green-50"
                      : highlightedWinner && "border-red-600 bg-red-50",
                  )}
                >
                  <Text className="text-center text-5xl font-medium text-[#1a1a1a]">
                    {score[side]}
                  </Text>
                  <Text className="mt-1 text-center text-xl font-medium text-[#1a1a1a]">
                    {getSideName(side)}
                  </Text>
                  {getSidePlayers(side) && (
                    <Text className="mt-0.5 text-center text-lg text-[#6b6b6b]">
                      {getSidePlayers(side)}
                    </Text>
                  )}
                  <Text className="mt-1 text-center text-sm text-[#6b6b6b]">
                    Sets {setsWon[side]}
                  </Text>
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
          )}

          {match.status === "concluded" ? (
            <View className="mt-4 items-center">
              <Text className="mb-3 text-center text-sm text-muted-foreground">
                Match concluded. Scoring is disabled.
              </Text>
              <Button variant="outline" onPress={startRematch}>
                <Text>Rematch</Text>
              </Button>
            </View>
          ) : (
            <View className="mt-4 flex-row items-center justify-between">
              <Button variant="ghost" onPress={resetSet}>
                <Text>Reset</Text>
              </Button>
              <Button variant="outline" onPress={endSet}>
                <Text>End Set {setNumber}</Text>
              </Button>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Quick Match"
        showBack
        onBackPress={() => router.back()}
        rightContent={
          match.status !== "concluded" ? (
            <MoreVertical size={22} color="#1a1a1a" />
          ) : null
        }
        onRightPress={toggleMatchOptions}
      />
      {isOptionsOpen && (
        <View className="absolute right-5 top-20 z-50 min-w-[190px] bg-white p-1 shadow-md">
          {match.status !== "concluded" && (
            <Pressable
              className="px-3 py-3"
              onPress={() => {
                setIsOptionsOpen(false);
                void toggleLandscape();
              }}
            >
              <Text className="text-sm text-[#1a1a1a]">
                {isLandscape ? "Use portrait mode" : "Use landscape mode"}
              </Text>
            </Pressable>
          )}
          {match.status === "upcoming" && (
            <Pressable
              className="px-3 py-3"
              onPress={() => {
                setIsOptionsOpen(false);
                router.push(`/quick/edit/${match.id}`);
              }}
            >
              <Text className="text-sm text-[#1a1a1a]">Edit match</Text>
            </Pressable>
          )}
        </View>
      )}
      <View className="flex-1 px-5">
        <View className="bg-white p-3 ">
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
                className="flex-row items-center justify-between bg-white px-4 py-3"
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
                    "flex-1 bg-white p-3",
                    highlightedWinner === side
                      ? "border-green-600 bg-green-50"
                      : highlightedWinner && "border-red-600 bg-red-50",
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
              <Button variant="outline" onPress={resetSet}>
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
