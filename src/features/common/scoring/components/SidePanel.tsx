import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Minus } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import SetPips from "./SetPips";

type SidePanelProps = {
  name: string;
  players?: string;
  score: number;
  setsWon: number;
  setsNeeded: number;
  isServing: boolean;
  onSetServer: () => void;
  isWinner: boolean;
  onAdd: () => void;
  onRemove: () => void;
  scoreSize: number;
  /** Changes whenever this side scores, to trigger the "bump" animation. */
  bumpKey: number;
};

/** One side of the scoreboard. The whole panel is the +1 tap zone. */
export default function SidePanel({
  name,
  players,
  score,
  setsWon,
  setsNeeded,
  isServing,
  onSetServer,
  isWinner,
  onAdd,
  onRemove,
  scoreSize,
  bumpKey,
}: SidePanelProps) {
  const { foreground } = useThemeColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (bumpKey === 0) return;
    scale.value = withSequence(
      withTiming(1.12, { duration: 90 }),
      withTiming(1, { duration: 140 }),
    );
  }, [bumpKey, scale]);

  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onAdd}
      disabled={isWinner}
      accessibilityRole="button"
      accessibilityLabel={`Add point to ${name}. Current score ${score}`}
      className={cn(
        "flex-1 overflow-hidden rounded-3xl border-2 p-3",
        isWinner ? "border-primary bg-tonal-surface" : "border-border bg-card active:bg-muted",
      )}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-lg font-bold" numberOfLines={1}>
            {name}
          </Text>
          {players ? (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {players}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onSetServer}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isServing ? `${name} is serving` : `Set ${name} as server`}
          className={cn(
            "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
            isServing ? "bg-primary" : "border border-border",
          )}
        >
          <View
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isServing ? "bg-primary-foreground" : "bg-muted-foreground",
            )}
          />
          <Text
            className={cn(
              "text-[11px] font-semibold",
              isServing ? "text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Serve
          </Text>
        </Pressable>
      </View>

      <SetPips won={setsWon} total={setsNeeded} className="mt-2" />

      <View className="flex-1 items-center justify-center">
        <Animated.View style={bumpStyle}>
          <Text
            accessibilityLiveRegion="polite"
            className="text-center font-extrabold"
            style={{
              fontSize: scoreSize,
              lineHeight: scoreSize * 1.05,
              fontVariant: ["tabular-nums"],
            }}
          >
            {score}
          </Text>
        </Animated.View>
      </View>

      <View className="flex-row items-center justify-end">
        <Pressable
          onPress={onRemove}
          disabled={score === 0}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`Subtract point from ${name}`}
          className={cn(
            "h-11 w-11 items-center justify-center rounded-full border border-border bg-background active:bg-muted",
            score === 0 && "opacity-40",
          )}
        >
          <Minus size={20} color={foreground} />
        </Pressable>
      </View>
    </Pressable>
  );
}
