import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

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
  const sideAName =
    match.matchType === "doubles"
      ? match.teamAName
      : match.playerA;
  const sideBName =
    match.matchType === "doubles"
      ? match.teamBName
      : match.playerB;

  const showSetScore = match.status !== "upcoming";
  const colorSetScore = match.status === "concluded";
  const teamAWon = match.teamASets > match.teamBSets;
  const livePulse = useRef(new Animated.Value(0.35)).current;
  const createdLabel = formatCreatedAt(match.createdAt);
  const endedLabel = match.endedAt ? formatCreatedAt(match.endedAt, "Ended") : null;

  useEffect(() => {
    if (match.status !== "ongoing") {
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
  }, [livePulse, match.status]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => onPress?.(match)}
      onLongPress={() => onLongPress?.(match)}
      className={`h-28 flex-row items-center justify-between px-4 ${selected ? "bg-muted" : ""}`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-[11px] capitalize text-[#8a8a8a]">
          {match.matchType}
        </Text>
        {match.rematchNumber > 0 && (
          <Text className="text-[11px] text-[#8a8a8a]">
            Rematch #{match.rematchNumber}
          </Text>
        )}
        <View className="flex-row items-center">
          <Text className="text-[15px] font-medium text-[#1a1a1a]">
            {sideAName}
          </Text>
          {showSetScore && (
            <Text className={`text-[15px] font-medium ${colorSetScore ? (teamAWon ? "text-green-600" : "text-red-600") : "text-[#1a1a1a]"}`}>
              {` (${match.teamASets})`}
            </Text>
          )}
          <Text className="text-[15px] font-medium text-[#1a1a1a]">{" vs "}</Text>
          <Text className="text-[15px] font-medium text-[#1a1a1a]">
            {sideBName}
          </Text>
          {showSetScore && (
            <Text className={`text-[15px] font-medium ${colorSetScore ? (teamAWon ? "text-red-600" : "text-green-600") : "text-[#1a1a1a]"}`}>
              {`(${match.teamBSets})`}
            </Text>
          )}
        </View>
        <Text className="mt-0.5 text-[11px] text-[#8a8a8a]">
          BO{match.bestOf} | {match.scoring} points
        </Text>
        <Text className="mt-0.5 text-[11px] text-[#8a8a8a]">
          {createdLabel}
        </Text>
        {endedLabel && (
          <Text className="mt-0.5 text-[11px] text-[#8a8a8a]">
            {endedLabel}
          </Text>
        )}
      </View>
      <View className="items-end">
        {selected ? (
          <CheckCircle2 size={20} color="#1a1a1a" />
        ) : match.status === "ongoing" ? (
          <View className="flex-row items-center">
            <Animated.View
              className="mr-1 h-2 w-2 rounded-full bg-red-600"
              style={{ opacity: livePulse }}
            />
            <Text className="text-[11px] font-medium text-red-600">Live</Text>
          </View>
        ) : (
          <Text className="text-[11px] capitalize text-[#8a8a8a]">
            {match.status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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