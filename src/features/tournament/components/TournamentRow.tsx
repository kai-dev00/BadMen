// import React, { useEffect, useRef } from "react";
// import { Animated, Text, TouchableOpacity, View } from "react-native";

// export type TournamentStatus = "draft" | "upcoming" | "ongoing" | "concluded";
// export type TournamentFormat = "round_robin" | "single_elim" | "swiss" | "other";

// export interface TournamentListItem {
//   id: string;
//   name: string;
//   matchType: "singles" | "doubles";
//   bestOf: number;
//   scoring: number;
//   format: TournamentFormat;
//   status: TournamentStatus;
//   playerCount: number;
// }

// const FORMAT_LABELS: Record<TournamentFormat, string> = {
//   round_robin: "Round Robin",
//   single_elim: "Single Elimination",
//   swiss: "Swiss",
//   other: "Other",
// };

// export default function TournamentRow({
//   tournament,
//   onPress,
//   onLongPress,
// }: {
//   tournament: TournamentListItem;
//   onPress?: (tournament: TournamentListItem) => void;
//   onLongPress?: (tournament: TournamentListItem) => void;
// }) {
//   const livePulse = useRef(new Animated.Value(0.35)).current;

//   useEffect(() => {
//     if (tournament.status !== "ongoing") {
//       livePulse.setValue(1);
//       return;
//     }

//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(livePulse, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(livePulse, {
//           toValue: 0.35,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ]),
//     );

//     animation.start();
//     return () => animation.stop();
//   }, [livePulse, tournament.status]);

//   return (
//     <TouchableOpacity
//       activeOpacity={0.6}
//       onPress={() => onPress?.(tournament)}
//       onLongPress={() => onLongPress?.(tournament)}
//       className="bg-white px-4 py-3"
//     >
//       <View className="flex-row items-center justify-between">
//         <Text className="flex-1 pr-3 text-base font-semibold text-[#1a1a1a]">
//           {tournament.name}
//         </Text>
//         {tournament.status === "ongoing" ? (
//           <View className="flex-row items-center">
//             <Animated.View
//               className="mr-1 h-2 w-2 rounded-full bg-red-600"
//               style={{ opacity: livePulse }}
//             />
//             <Text className="text-[11px] font-medium text-red-600">Live</Text>
//           </View>
//         ) : (
//           <Text className="text-xs capitalize text-[#8a8a8a]">
//             {tournament.status}
//           </Text>
//         )}
//       </View>
//       <Text className="mt-1 text-sm text-[#6b6b6b]">
//         {FORMAT_LABELS[tournament.format]} | {tournament.playerCount} players
//       </Text>
//       <Text className="mt-1 text-xs capitalize text-[#8a8a8a]">
//         {tournament.matchType} | BO{tournament.bestOf} | {tournament.scoring} points
//       </Text>
//     </TouchableOpacity>
//   );
// }

import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

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
      className={`px-4 py-3 ${selected ? "bg-muted" : "bg-white"}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-3 text-base font-semibold text-[#1a1a1a]">
          {tournament.name}
        </Text>
        {selected ? (
          <CheckCircle2 size={20} color="#1a1a1a" />
        ) : tournament.status === "ongoing" ? (
          <View className="flex-row items-center">
            <Animated.View
              className="mr-1 h-2 w-2 rounded-full bg-red-600"
              style={{ opacity: livePulse }}
            />
            <Text className="text-[11px] font-medium text-red-600">Live</Text>
          </View>
        ) : (
          <Text className="text-xs capitalize text-[#8a8a8a]">
            {tournament.status}
          </Text>
        )}
      </View>
      <Text className="mt-1 text-sm text-[#6b6b6b]">
        {FORMAT_LABELS[tournament.format]} | {tournament.playerCount} players
      </Text>
      <Text className="mt-1 text-xs capitalize text-[#8a8a8a]">
        {tournament.matchType} | BO{tournament.bestOf} | {tournament.scoring} points
      </Text>
    </TouchableOpacity>
  );
}