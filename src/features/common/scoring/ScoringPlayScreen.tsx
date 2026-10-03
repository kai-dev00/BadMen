import {
  ArrowLeftRight,
  Maximize,
  Minimize,
  Pencil,
} from "lucide-react-native";
import { formatListDate } from "../dates";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { Stack, useNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import Header from "../header";
import ActionBar from "./components/ActionBar";
import ConcludedSummary from "./components/ConcludedSummary";
import MetaChips from "./components/MetaChips";
import SetHistoryStrip from "./components/SetHistoryStrip";
import SidePanel from "./components/SidePanel";
import StatusBanner, { type BannerState } from "./components/StatusBanner";
import { useScoringSession } from "./hooks/useScoringSession";
import {
  getSetWinner,
  isDeuceTight,
  isMatchPoint,
  isSetPoint,
  setsToWin,
} from "./scoringRules";
import type {
  CompleteSetPayload,
  ScoringMatchView,
  ScoringSet,
  ScoringSide,
} from "./types";

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

const SIDES: ScoringSide[] = ["A", "B"];

const tick = () => {
  void Haptics.selectionAsync().catch(() => {});
};
const success = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
  const { foreground } = useThemeColors();
  const { height } = useWindowDimensions();
  const session = useScoringSession({
    matchKey,
    initialSets,
    scoring: match?.scoring,
  });
  const { score, setsWon, setNumber, setHistory, server } = session;

  const [isLandscape, setIsLandscape] = useState(false);
  const [isChangingOrientation, setIsChangingOrientation] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const isLive = match != null && match.status !== "concluded";

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  // Keep the screen on while a match is being scored.
  useEffect(() => {
    if (!isLive) return;
    void activateKeepAwakeAsync("scoring");
    return () => {
      void deactivateKeepAwake("scoring");
    };
  }, [isLive]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    if (isLandscape) {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none", height: 0 },
      });
    }
    return () => {
      navigation.setOptions({ headerShown: false });
      if (isLandscape) {
        navigation.getParent()?.setOptions({ tabBarStyle: undefined });
      }
    };
  }, [isLandscape, navigation]);

  useEffect(() => {
    if (match?.status !== "concluded" || !isLandscape) return;

    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).then(() =>
      setIsLandscape(false),
    );
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

  function getSideName(side: ScoringSide) {
    if (!match) return side;
    return side === "A" ? match.sideAName : match.sideBName;
  }

  function getSidePlayers(side: ScoringSide) {
    if (!match || match.matchType === "singles") return undefined;
    return (side === "A" ? match.sideAPlayers : match.sideBPlayers).join(" / ") || undefined;
  }

  function handleAdd(side: ScoringSide) {
    if (!match || match.status === "concluded") return;
    if (getSetWinner(score, match.scoring)) return;
    if (!session.addPoint(side)) return;

    const next = { ...score, [side]: score[side] + 1 };
    if (getSetWinner(next, match.scoring)) success();
    else tick();
  }

  function handleRemove(side: ScoringSide) {
    if (!isLive) return;
    session.removePoint(side);
    tick();
  }

  function handleUndo() {
    session.undo();
    tick();
  }

  function handleReset() {
    if (score.A === 0 && score.B === 0) return;

    Alert.alert("Reset set?", "This clears the current set score.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: session.resetSet },
    ]);
  }

  async function endSet() {
    if (!match || match.status === "concluded") return;

    const winner = getSetWinner(score, match.scoring);
    if (!winner) return;

    const nextSetsWon = { ...setsWon, [winner]: setsWon[winner] + 1 };
    const completedSet = {
      setNumber,
      teamAScore: score.A,
      teamBScore: score.B,
    };
    const matchComplete = nextSetsWon[winner] >= setsToWin(match.bestOf);

    await onCompleteSet({
      ...completedSet,
      teamASets: nextSetsWon.A,
      teamBSets: nextSetsWon.B,
      winner,
      matchComplete,
    });

    session.commitSet(winner, completedSet, matchComplete);
    success();
   
  }

  async function startRematch() {
    if (!onRematch) return;
    await onRematch();
  }

  function getBanner(): BannerState {
    if (!match) return null;

    const winner = getSetWinner(score, match.scoring);
    if (winner) {
      return { tone: "setWon", text: `${getSideName(winner)} wins set ${setNumber}` };
    }

    for (const side of SIDES) {
      if (isMatchPoint(score, match.scoring, side, setsWon, match.bestOf)) {
        return { tone: "matchPoint", text: `Match point — ${getSideName(side)}` };
      }
    }
    for (const side of SIDES) {
      if (isSetPoint(score, match.scoring, side)) {
        return { tone: "setPoint", text: `Set point — ${getSideName(side)}` };
      }
    }
    if (isDeuceTight(score, match.scoring)) {
      return { tone: "deuce", text: "Deuce — win by 2" };
    }
    return null;
  }

  if (isLoading || !match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">
          {isLoading ? "Loading match..." : notFoundLabel}
        </Text>
      </SafeAreaView>
    );
  }

  const concluded = match.status === "concluded";
  const canEditMatch = match.status === "upcoming" && Boolean(onEdit);
  const setWinner = getSetWinner(score, match.scoring);
  const banner = getBanner();
  const order = isSwapped ? [...SIDES].reverse() : SIDES;
  const needed = setsToWin(match.bestOf);

  const scoreSize = isLandscape
    ? Math.max(64, Math.min(170, height * 0.38))
    : Math.max(72, Math.min(140, ((height - 380) / 2) * 0.55));

  const panels = order.map((side) => (
    <SidePanel
      key={side}
      name={getSideName(side)}
      players={getSidePlayers(side)}
      score={score[side]}
      setsWon={setsWon[side]}
      setsNeeded={needed}
      isServing={server === side}
      onSetServer={() => session.setServer(side)}
      isWinner={setWinner === side}
      onAdd={() => handleAdd(side)}
      onRemove={() => handleRemove(side)}
      scoreSize={scoreSize}
      bumpKey={session.lastScored?.side === side ? session.lastScored.n : 0}
    />
  ));

  const actionBar = (
    <ActionBar
      canUndo={session.canUndo}
      onUndo={handleUndo}
      onReset={handleReset}
      canEndSet={setWinner !== null}
      onEndSet={endSet}
      endLabel={`End set ${setNumber}`}
      compact={isLandscape}
    />
  );

  const summary = (
    <ConcludedSummary
      sideAName={match.sideAName}
      sideBName={match.sideBName}
      setsWonA={setsWon.A}
      setsWonB={setsWon.B}
      sets={setHistory}
      createdLabel={match.createdAt ? formatListDate(match.createdAt) : null}
      onRematch={onRematch ? startRematch : undefined}
    />
  );

  if (isLandscape) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar hidden />
        <Stack.Screen options={{ headerShown: false }} />
        {concluded ? (
          summary
        ) : (
          <View className="flex-1 gap-2 px-6 pb-3 pt-2">
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <Text className="text-sm font-bold">
                  SET {setNumber}
                  <Text className="text-sm font-normal text-muted-foreground">
                    {`  ·  ${match.matchType === "singles" ? "Singles" : "Doubles"}  ·  BO${match.bestOf}  ·  to ${match.scoring}`}
                  </Text>
                </Text>
              </View>
              <View className="flex-[1.4]">
                <StatusBanner state={banner} compact />
              </View>
              <View className="flex-1 flex-row items-center justify-end">
                <IconButton onPress={() => setIsSwapped((v) => !v)} accessibilityLabel="Swap sides">
                  <ArrowLeftRight size={22} color={foreground} />
                </IconButton>
                <IconButton
                  onPress={toggleLandscape}
                  disabled={isChangingOrientation}
                  accessibilityLabel="Use portrait mode"
                >
                  <Minimize size={22} color={foreground} />
                </IconButton>
              </View>
            </View>

            <View className="flex-1 flex-row gap-3">{panels}</View>

            {actionBar}
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={title}
        showBack
        onBackPress={() => router.back()}
        rightActions={
          concluded ? null : (
            <>
              <IconButton onPress={() => setIsSwapped((v) => !v)} accessibilityLabel="Swap sides">
                <ArrowLeftRight size={22} color={foreground} />
              </IconButton>
              <IconButton
                onPress={toggleLandscape}
                disabled={isChangingOrientation}
                accessibilityLabel="Use landscape mode"
              >
                <Maximize size={22} color={foreground} />
              </IconButton>
            </>
          )
        }
        rightContent={canEditMatch ? <Pencil size={22} /> : null}
        onRightPress={onEdit}
        rightAccessibilityLabel="Edit match"
      />

      {concluded ? (
        <View className="flex-1">{summary}</View>
      ) : (
        <View className="flex-1 gap-2 px-4 pb-2">
          <View className="flex-row items-center gap-2">
            <MetaChips match={match} />
          </View>

          <Text className="text-center text-xs font-bold tracking-widest text-muted-foreground">
            SET {setNumber}
          </Text>

          <SetHistoryStrip sets={setHistory} />

          <StatusBanner state={banner} />

          <View className="flex-1 gap-3">{panels}</View>

          {actionBar}
        </View>
      )}
    </SafeAreaView>
  );
}

