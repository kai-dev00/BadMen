import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, Monitor, Moon, Sun, Trophy, Zap, Radio } from "lucide-react-native";

import Header from "../common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useTheme } from "@/src/hooks/useTheme";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useQuickMatches } from "../quick/hooks/useQuickMatches";
import { useTournaments } from "../tournament/hooks/useTournaments";
import { FORMAT_LABELS, TournamentStatusBadge } from "../tournament/components/TournamentRow";

const PREFERENCE_ICON = { light: Sun, dark: Moon, system: Monitor } as const;

type QuickMatchItem = ReturnType<typeof useQuickMatches>["matches"][number];

function sideNames(match: QuickMatchItem) {
  return match.matchType === "doubles"
    ? [match.teamAName, match.teamBName]
    : [match.teamA.join(" / "), match.teamB.join(" / ")];
}

export function HomeScreen() {
  const { preference, cycle } = useTheme();
  const ThemeIcon = PREFERENCE_ICON[preference];
  const { primaryForeground, mutedForeground } = useThemeColors();
  const { matches } = useQuickMatches();
  const { tournaments } = useTournaments();

  const sorted = [...matches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const liveMatch = sorted.find((match) => match.status === "ongoing");
  const recent = sorted.filter((match) => match.id !== liveMatch?.id).slice(0, 4);
  const activeTournament =
    tournaments.find((t) => t.status === "ongoing") ??
    tournaments.find((t) => t.status === "upcoming");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header
        title="Home"
        subtitle="Ready to play?"
        rightContent={<ThemeIcon size={22} />}
        onRightPress={cycle}
        rightAccessibilityLabel={`Theme: ${preference}. Tap to change.`}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Live / resume */}
        {liveMatch ? (
          <Card tonal className="gap-4 p-4">
            <View className="flex-row items-center justify-between">
              <Badge label="Live" icon={Radio} variant="live" />
              <Text className="text-xs text-muted-foreground">
                {liveMatch.matchType === "singles" ? "Singles" : "Doubles"} · BO{liveMatch.bestOf} ·{" "}
                {liveMatch.scoring} pts
              </Text>
            </View>
            <View className="flex-row items-center">
              {sideNames(liveMatch).map((name, index) => (
                <View key={index} className="flex-1 items-center gap-1">
                  <Text className="text-sm font-semibold" numberOfLines={1}>
                    {name}
                  </Text>
                  <Text
                    className="text-4xl font-extrabold"
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {index === 0 ? liveMatch.teamASets : liveMatch.teamBSets}
                  </Text>
                </View>
              ))}
            </View>
            <Button className="h-12" onPress={() => router.push(`/quick/${liveMatch.id}`)}>
              <Text className="font-bold">Continue scoring</Text>
            </Button>
          </Card>
        ) : null}

        {/* Quick actions */}
        <View className="gap-3">
          <Text className="text-base font-bold">Start playing</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/quick/add")}
              accessibilityRole="button"
              accessibilityLabel="New quick match"
              className="min-h-[120px] flex-1 justify-between rounded-2xl bg-primary p-4 active:bg-primary/90"
            >
              <Zap size={26} color={primaryForeground} />
              <View>
                <Text className="text-base font-bold text-primary-foreground">Quick match</Text>
                <Text className="text-xs text-primary-foreground/70">Track a live score</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/tournament/add")}
              accessibilityRole="button"
              accessibilityLabel="New tournament"
              className="min-h-[120px] flex-1 justify-between rounded-2xl border border-border bg-card p-4 active:bg-muted"
            >
              <Trophy size={26} color={mutedForeground} />
              <View>
                <Text className="text-base font-bold">Tournament</Text>
                <Text className="text-xs text-muted-foreground">Create a bracket</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Tournament */}
        {activeTournament ? (
          <View className="gap-3">
            <SectionHeader title="My tournament" action="All" onAction={() => router.push("/tournament")} />
            <Pressable
              onPress={() => router.push(`/tournament/${activeTournament.id}`)}
              className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 active:bg-muted"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Trophy size={20} color={mutedForeground} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[15px] font-semibold" numberOfLines={1}>
                  {activeTournament.name}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {FORMAT_LABELS[activeTournament.format]} · {activeTournament.players.length} players
                </Text>
              </View>
              <TournamentStatusBadge status={activeTournament.status} />
            </Pressable>
          </View>
        ) : null}

        {/* Recent matches */}
        <View className="gap-3">
          <SectionHeader
            title="Recent matches"
            action={recent.length > 0 ? "See all" : undefined}
            onAction={() => router.push("/quick")}
          />
          {recent.length === 0 ? (
            <Card className="items-center gap-1 p-6">
              <Text className="text-sm font-semibold">No matches yet</Text>
              <Text className="text-center text-xs text-muted-foreground">
                Your finished and upcoming quick matches will show up here.
              </Text>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {recent.map((match, index) => {
                const [a, b] = sideNames(match);
                const started = match.status !== "upcoming";
                return (
                  <Pressable
                    key={match.id}
                    onPress={() => router.push(`/quick/${match.id}`)}
                    className={cn(
                      "min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-muted",
                      index > 0 && "border-t border-border",
                    )}
                  >
                    <View className="flex-1 gap-0.5">
                      <Text className="text-sm font-semibold" numberOfLines={1}>
                        {a} vs {b}
                      </Text>
                      <Text className="text-xs capitalize text-muted-foreground">
                        {match.matchType} · {match.status}
                      </Text>
                    </View>
                    {started ? (
                      <Text
                        className="text-base font-extrabold"
                        style={{ fontVariant: ["tabular-nums"] }}
                      >
                        {match.teamASets} – {match.teamBSets}
                      </Text>
                    ) : null}
                    <ChevronRight size={18} color={mutedForeground} />
                  </Pressable>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-bold">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text className="text-sm font-semibold text-muted-foreground">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
