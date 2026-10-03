import React from "react";
import { Pressable, View } from "react-native";
import { CheckCircle2, Trophy, Radio, Pencil, Clock } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { formatListDate } from "@/src/features/common/dates";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export type TournamentStatus = "draft" | "upcoming" | "ongoing" | "concluded";
export type TournamentFormat = "round_robin" | "single_elim" | "swiss" | "other";

export interface TournamentListItem {
  id: string;
  name: string;
  matchType: "singles" | "doubles";
  bestOf: number;
  scoring: number;
  format: TournamentFormat;
  status: TournamentStatus;
  playerCount: number;
  createdAt: string;
  updatedAt: string;
}

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  round_robin: "Round Robin",
  single_elim: "Single Elimination",
  swiss: "Swiss",
  other: "Other",
};

export const TOURNAMENT_ROW_HEIGHT = 96;

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  if (status === "ongoing") return <Badge label="Live" icon={Radio} variant="live" />;
  if (status === "concluded") return <Badge label="Done" icon={CheckCircle2} variant="done" />;
  if (status === "draft") return <Badge label="Draft" icon={Pencil} variant="outline" />;
  return <Badge label="Upcoming" icon={Clock} variant="outline" />;
}

export default function TournamentRow({
  tournament,
  selected = false,
  onPress,
  onLongPress,
}: {
  tournament: TournamentListItem;
  selected?: boolean;
  onPress?: (tournament: TournamentListItem) => void;
  onLongPress?: (tournament: TournamentListItem) => void;
}) {
  const { foreground, mutedForeground } = useThemeColors();

  return (
    <Pressable
      onPress={() => onPress?.(tournament)}
      onLongPress={() => onLongPress?.(tournament)}
      style={{ height: TOURNAMENT_ROW_HEIGHT }}
      className={cn(
        "flex-row items-center gap-3 px-4",
        selected ? "bg-tonal-surface" : "active:bg-muted",
      )}
    >
      {/* <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Trophy size={20} color={mutedForeground} />
      </View> */}

      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold" numberOfLines={1}>
          {tournament.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {FORMAT_LABELS[tournament.format]} · {tournament.playerCount} players
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {tournament.matchType === "singles" ? "Singles" : "Doubles"} · BO{tournament.bestOf} ·{" "}
          {tournament.scoring} pts
        </Text>
      </View>

      <View className="items-center justify-center gap-1">
        {selected ? (
          <CheckCircle2 size={22} color={foreground} />
        ) : (
          <TournamentStatusBadge status={tournament.status} />
        )}
        <Text className="text-[11px] text-muted-foreground">{formatListDate(tournament.createdAt)}</Text>
      </View>
    </Pressable>
  );
}
