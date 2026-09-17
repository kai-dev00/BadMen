import {
  ArrowLeftRight,
  Minimize,
  Minus,
  MoreVertical,
  Plus,
} from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack, useNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import Header from "../header";
import { cn } from "@/lib/utils";
import type {
  CompleteSetPayload,
  ScoringMatchView,
  ScoringSet,
  ScoringSide,
} from "./types";

type Score = {
  A: number;
  B: number;
};

type ScoringPlayScreenProps = {
  title: string;
  isLoading: boolean;
  match: ScoringMatchView | null;
  matchKey?: string | number;
  initialSets: ScoringSet[];
  notFoundLabel?: string;
  onCompleteSet: (payload: CompleteSetPayload) => Promise<void>;
  onRematch?: () => Promise<void>;
  onEdit?: () => void;
};

export default function ScoringPlayScreen({
  title,
  isLoading,
  match,
  matchKey,
  initialSets,
  notFoundLabel = "Match not found.",
  onCompleteSet,
  onRematch,
  onEdit,
}: ScoringPlayScreenProps) {
  const navigation = useNavigation();
  const [score, setScore] = useState<Score>({ A: 0, B: 0 });
  const [setsWon, setSetsWon] = useState<Score>({ A: 0, B: 0 });
  const [setNumber, setSetNumber] = useState(1);
  const [setHistory, setSetHistory] = useState<ScoringSet[]>([]);
  const [lastSetResult, setLastSetResult] = useState<{
    winner: ScoringSide;
    score: Score;
  } | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isChangingOrientation, setIsChangingOrientation] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    const history = initialSets;
    setSetHistory(history);
    setSetsWon({
      A: history.filter((set) => set.teamAScore > set.teamBScore).length,
      B: history.filter((set) => set.teamBScore > set.teamAScore).length,
    });
    setSetNumber(history.length + 1);
    setScore({ A: 0, B: 0 });
    setLastSetResult(null);
  }, [matchKey]);

  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT,
    );

    return () => {
      void ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT,
      );
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    navigation.getParent()?.setOptions({
      tabBarStyle: isLandscape ? { display: "none", height: 0 } : undefined,
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

  function toggleSwapSides() {
    setIsSwapped((current) => !current);
  }

  function changeScore(side: ScoringSide, amount: number) {
    if (amount > 0 && match) {
      const other: ScoringSide = side === "A" ? "B" : "A";
      const currentSide = score[side];
      const currentOther = score[other];
      const deuceStartsAt = Math.max(1, match.scoring - 1);
      const isDeuce =
        currentSide >= deuceStartsAt && currentOther >= deuceStartsAt;

      if (!isDeuce && currentSide + 1 > match.scoring) {
        return;
      }
    }

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
    const isDeuce = score.A >= deuceStartsAt && score.B >= deuceStartsAt;

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
      Alert.alert(
        "Set is tied",
        "One side must be ahead before ending the set.",
      );
      return;
    }

    const winner: ScoringSide = score.A > score.B ? "A" : "B";
    const nextSetsWon = {
      ...setsWon,
      [winner]: setsWon[winner] + 1,
    };
    const completedSet = {
      setNumber,
      teamAScore: score.A,
      teamBScore: score.B,
    };
    const matchComplete = nextSetsWon[winner] >= match.bestOf;

    await onCompleteSet({
      ...completedSet,
      teamASets: nextSetsWon.A,
      teamBSets: nextSetsWon.B,
      winner,
      matchComplete,
    });

    setSetHistory((current) => [...current, completedSet]);
    setLastSetResult({
      winner,
      score: { A: score.A, B: score.B },
    });
    setSetsWon(nextSetsWon);
    setScore({ A: 0, B: 0 });

    if (matchComplete) {
      Alert.alert(
        "Match complete",
        `${winner === "A" ? getSideName("A") : getSideName("B")} wins the match.`,
      );
      return;
    }

    setSetNumber((current) => current + 1);
  }

  function getSideName(side: ScoringSide) {
    if (!match) return side;
    return side === "A" ? match.sideAName : match.sideBName;
  }

  function getSidePlayers(side: ScoringSide) {
    if (!match || match.matchType === "singles") return "";
    return (side === "A" ? match.sideAPlayers : match.sideBPlayers).join(" / ");
  }

  function getSetWinner(set: ScoringSet) {
    return set.teamAScore > set.teamBScore
      ? getSideName("A")
      : getSideName("B");
  }

  function getCurrentWinner(): ScoringSide | null {
    if (!match || score.A === score.B) return null;

    const deuceStartsAt = Math.max(1, match.scoring - 1);
    const isDeuce = score.A >= deuceStartsAt && score.B >= deuceStartsAt;

    if (isDeuce && Math.abs(score.A - score.B) < 2) {
      return null;
    }

    if (score.A >= match.scoring || score.B >= match.scoring) {
      return score.A > score.B ? "A" : "B";
    }

    return null;
  }

  async function startRematch() {
    if (!onRematch) return;
    await onRematch();
  }

  if (isLoading || !match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fafafa]">
        <Text className="text-muted-foreground">
          {isLoading ? "Loading match..." : notFoundLabel}
        </Text>
      </SafeAreaView>
    );
  }

  const currentWinner = getCurrentWinner();
  const highlightedWinner = currentWinner ?? lastSetResult?.winner;
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const showOptions = match.status !== "concluded" || Boolean(onEdit);

  if (isLandscape) {
    return (
      <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="m-1 flex-1 bg-white px-4 py-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-medium text-[#1a1a1a]">
                {match.status === "concluded" ? "History" : `Set ${setNumber}`}{" "}
                | {capitalize(match.matchType)}
              </Text>
            </View>
            {match.status !== "concluded" && (
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={toggleSwapSides}
                  accessibilityRole="button"
                  accessibilityLabel="Swap sides"
                  hitSlop={8}
                >
                  <ArrowLeftRight size={22} color="#1a1a1a" />
                </Pressable>
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
              </View>
            )}
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-xs capitalize text-[#8a8a8a]">
              best of {match.bestOf} | up to {match.scoring}
              {match.rematchNumber != null &&
                match.rematchNumber > 0 &&
                ` | Rematch #${match.rematchNumber}`}
            </Text>
            {match.createdAt ? (
              <Text className="text-xs text-[#8a8a8a]">
                {formatCreatedAt(match.createdAt)}
                {match.endedAt &&
                  ` | ${formatCreatedAt(match.endedAt, "Ended")}`}
              </Text>
            ) : null}
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
              {(isSwapped
                ? (["B", "A"] as ScoringSide[])
                : (["A", "B"] as ScoringSide[])
              ).map((side) => (
                // <View
                //   key={side}
                //   className={cn(
                //     "flex-1 items-center justify-center p-3",
                //     highlightedWinner === side
                //       ? "border-green-600 bg-green-50"
                //       : highlightedWinner && "border-red-600 bg-red-50",
                //   )}
                // >
                <View key={side} className="flex-1 bg-white p-3">
                  <Text className="text-center text-5xl font-medium text-[#1a1a1a]">
                    {score[side]}
                  </Text>
                  <Text className="mt-1 text-center text-xl font-medium text-[#1a1a1a]">
                    {getSideName(side)}
                  </Text>
                  {getSidePlayers(side) ? (
                    <Text className="mt-0.5 text-center text-lg text-[#6b6b6b]">
                      {getSidePlayers(side)}
                    </Text>
                  ) : null}
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
              {onRematch ? (
                <Button variant="outline" onPress={startRematch}>
                  <Text>Rematch</Text>
                </Button>
              ) : null}
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
        title={title}
        showBack
        onBackPress={() => router.back()}
        rightContent={
          showOptions ? <MoreVertical size={22} color="#1a1a1a" /> : null
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
          {match.status === "upcoming" && onEdit ? (
            <Pressable
              className="px-3 py-3"
              onPress={() => {
                setIsOptionsOpen(false);
                onEdit();
              }}
            >
              <Text className="text-sm text-[#1a1a1a]">Edit match</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      <View className="flex-1 px-5">
        <View className="bg-white p-3 ">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-base font-semibold text-[#1a1a1a]">
                {getSideName("A")} ({setsWon.A})
              </Text>
              {getSidePlayers("A") ? (
                <Text className="mt-0.5 text-xs text-[#6b6b6b]">
                  {getSidePlayers("A")}
                </Text>
              ) : null}
            </View>
            <Text className="pt-0.5 text-xs font-medium text-[#8a8a8a]">
              BO{match.bestOf}
            </Text>
            <View className="flex-1 items-end pl-3">
              <Text className="text-right text-base font-semibold text-[#1a1a1a]">
                {getSideName("B")} ({setsWon.B})
              </Text>
              {getSidePlayers("B") ? (
                <Text className="mt-0.5 text-right text-xs text-[#6b6b6b]">
                  {getSidePlayers("B")}
                </Text>
              ) : null}
            </View>
          </View>
          <Text className="mt-1 text-xs capitalize text-[#8a8a8a]">
            {match.matchType} | best of {match.bestOf} | up to {match.scoring}
          </Text>
          {match.rematchNumber != null && match.rematchNumber > 0 ? (
            <Text className="mt-1 text-xs text-[#8a8a8a]">
              Rematch #{match.rematchNumber}
            </Text>
          ) : null}
          {match.createdAt ? (
            <Text className="mt-1 text-xs text-[#8a8a8a]">
              {formatCreatedAt(match.createdAt)}
            </Text>
          ) : null}
          {match.endedAt ? (
            <Text className="mt-1 text-xs text-[#8a8a8a]">
              {formatCreatedAt(match.endedAt, "Ended")}
            </Text>
          ) : null}
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
            {onRematch ? (
              <Button className="mt-4" variant="outline" onPress={startRematch}>
                <Text>Rematch</Text>
              </Button>
            ) : null}
          </View>
        ) : (
          <>
            <View className="flex-row gap-5">
              {(["A", "B"] as ScoringSide[]).map((side) => (
                <View
                  key={side}
                  className="flex-1 items-center justify-center p-3"
                >
                  <Text className="text-center text-xl font-medium text-[#1a1a1a]">
                    {score[side]}
                  </Text>
                  <Text className="mt-1 text-center text-sm font-medium text-[#1a1a1a]">
                    {getSideName(side)}
                  </Text>
                  {getSidePlayers(side) ? (
                    <Text className="mt-0.5 text-center text-xs text-[#6b6b6b]">
                      {getSidePlayers(side)}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-center text-xs text-[#8a8a8a]">
                    Sets won: {setsWon[side]}
                  </Text>
                  {currentWinner ? (
                    <Text className="mt-2 text-center text-xs font-medium text-green-700">
                      Ready to end set
                    </Text>
                  ) : null}
                  {/* {lastSetResult && !currentWinner ? (
                    <Text
                      className={cn(
                        "mt-2 text-center text-xs font-medium",
                        lastSetResult.winner === side
                          ? "text-green-700"
                          : "text-red-700",
                      )}
                    >
                      {lastSetResult.winner === side ? "Set won" : "Set lost"} (
                      {lastSetResult.score[side]})
                    </Text>
                  ) : null} */}

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

            {setHistory.length > 0 && (
              <View className="mt-8 gap-3">
                <Text className="text-center text-base font-medium text-[#1a1a1a]">
                  Match history
                </Text>
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
              </View>
            )}
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
