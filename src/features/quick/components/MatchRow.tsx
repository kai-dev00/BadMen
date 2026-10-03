import React from "react";
import { Pressable, View } from "react-native";
import { CheckCircle2, Radio, Clock } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { formatListDate } from "@/src/features/common/dates";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export type MatchStatus = "concluded" | "ongoing" | "upcoming";

export interface Match {
  id: string;
  matchType: "singles" | "doubles";
  bestOf: number;
  scoring: number;
  rematchNumber: number;
  createdAt: string;
  endedAt: string | null;
  teamASets: number;
  teamBSets: number;
  teamAName: string;
  teamBName: string;
  playerA: string;
  playerB: string;
  status: MatchStatus;
  result?: string;
}

export const MATCH_ROW_HEIGHT = 96;

export default function MatchRow({
  match,
  selected = false,
  onPress,
  onLongPress,
}: {
  match: Match;
  selected?: boolean;
  onPress?: (match: Match) => void;
  onLongPress?: (match: Match) => void;
}) {
  const { foreground } = useThemeColors();

  const sideAName = match.matchType === "doubles" ? match.teamAName : match.playerA;
  const sideBName = match.matchType === "doubles" ? match.teamBName : match.playerB;

  const showSetScore = match.status !== "upcoming";
  const concluded = match.status === "concluded";
  const aWon = concluded && match.teamASets > match.teamBSets;
  const bWon = concluded && match.teamBSets > match.teamASets;

  const meta = [
    match.matchType === "singles" ? "Singles" : "Doubles",
    `BO${match.bestOf}`,
    `${match.scoring} pts`,
    match.rematchNumber > 0 ? `Rematch #${match.rematchNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={() => onPress?.(match)}
      onLongPress={() => onLongPress?.(match)}
      style={{ height: MATCH_ROW_HEIGHT }}
      className={cn(
        "flex-row items-center gap-3 px-4",
        selected ? "bg-tonal-surface" : "active:bg-muted",
      )}
    >
      <View className="flex-1 gap-1">
        <TeamLine name={sideAName} sets={match.teamASets} showSets={showSetScore} won={aWon} dim={bWon} />
        <TeamLine name={sideBName} sets={match.teamBSets} showSets={showSetScore} won={bWon} dim={aWon} />
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <View className="items-center justify-center gap-1">
        {selected ? (
          <CheckCircle2 size={22} color={foreground} />
        ) : match.status === "ongoing" ? (
          <Badge label="Live" icon={Radio} variant="live" />
        ) : concluded ? (
          <Badge label="Done" icon={CheckCircle2} variant="done" />
        ) : (
          <Badge label="Upcoming" icon={Clock} variant="outline" />
        )}
        <Text className="text-[11px] text-muted-foreground">{formatListDate(match.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

function TeamLine({
  name,
  sets,
  showSets,
  won,
  dim,
}: {
  name: string;
  sets: number;
  showSets: boolean;
  won: boolean;
  dim: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Text
        numberOfLines={1}
        className={cn("flex-1 text-[15px]", won ? "font-bold" : "font-medium", dim && "text-muted-foreground")}
      >
        {name}
      </Text>
      {showSets ? (
        <Text
          className={cn("w-5 text-right text-[15px]", won ? "font-extrabold" : "text-muted-foreground")}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {sets}
        </Text>
      ) : null}
    </View>
  );
}

