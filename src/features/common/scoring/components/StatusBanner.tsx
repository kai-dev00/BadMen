import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

export type BannerTone = "deuce" | "setPoint" | "matchPoint" | "setWon";

export type BannerState = { tone: BannerTone; text: string } | null;

const TONE_STYLES: Record<BannerTone, { box: string; text: string }> = {
  deuce: { box: "bg-destructive/15", text: "text-destructive" },
  setPoint: { box: "bg-primary", text: "text-primary-foreground" },
  matchPoint: { box: "bg-primary", text: "text-primary-foreground font-extrabold" },
  setWon: { box: "bg-success", text: "text-success-foreground" },
};

/**
 * Fixed-height slot so the score panels never jump when the banner appears.
 * `compact` is the landscape top-bar variant.
 */
export default function StatusBanner({
  state,
  compact = false,
}: {
  state: BannerState;
  compact?: boolean;
}) {
  return (
    <View className={cn("items-center justify-center", compact ? "h-0" : "h-0")}>
      {state ? (
        <View
          className={cn("max-w-full rounded-full px-4 py-1.5", TONE_STYLES[state.tone].box)}
          accessibilityLiveRegion="polite"
        >
          <Text
            numberOfLines={1}
            className={cn("text-sm font-bold", TONE_STYLES[state.tone].text)}
          >
            {state.text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
