import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
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
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  round_robin: "Round Robin",
  single_elim: "Single Elimination",
  swiss: "Swiss",
  other: "Other",
};

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
  const { foreground } = useThemeColors();
  const livePulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (tournament.status !== "ongoing") {
      livePulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [livePulse, tournament.status]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => onPress?.(tournament)}
      onLongPress={() => onLongPress?.(tournament)}
      className={`h-28 flex-row items-center justify-between px-4 ${selected ? "bg-muted" : ""}`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-medium text-foreground">
          {tournament.name}
        </Text>
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {FORMAT_LABELS[tournament.format]} | {tournament.playerCount} players
        </Text>
        <Text className="mt-0.5 text-[11px] text-muted-foreground capitalize">
          {tournament.matchType} | BO{tournament.bestOf} | {tournament.scoring} points
        </Text>
      </View>
      <View className="items-end">
        {selected ? (
          <CheckCircle2 size={20} color={foreground} />
        ) : tournament.status === "ongoing" ? (
          <View className="flex-row items-center">
            <Animated.View
              className="mr-1 h-2 w-2 rounded-full bg-destructive"
              style={{ opacity: livePulse }}
            />
            <Text className="text-[11px] font-medium text-destructive">Live</Text>
          </View>
        ) : (
          <Text className="text-[11px] capitalize text-muted-foreground">
            {tournament.status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}