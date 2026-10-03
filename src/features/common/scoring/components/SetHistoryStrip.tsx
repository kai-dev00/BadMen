import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ScoringSet } from "../types";

/**
 * Compact row of finished sets, e.g. `S1  21–17`.
 *
 * Fixed height and `flexGrow: 0` on purpose: a horizontal ScrollView defaults
 * to flexGrow 1 and would otherwise steal height from the score panels.
 * Renders nothing when there are no sets, so the layout is unchanged until the
 * first set ends. Chips are centered; the row scrolls only if they overflow.
 */
export default function SetHistoryStrip({ sets }: { sets: ScoringSet[] }) {
  if (sets.length === 0) return null;

  return (
    <View className="h-9">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", gap: 8 }}
      >
        {sets.map((set) => {
          const aWon = set.teamAScore > set.teamBScore;
          return (
            <View
              key={set.setNumber}
              className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-1"
            >
              <Text className="text-xs font-semibold text-muted-foreground">S{set.setNumber}</Text>
              <Text className="text-sm" style={{ fontVariant: ["tabular-nums"] }}>
                <Text className={cn("text-sm", aWon ? "font-extrabold" : "text-muted-foreground")}>
                  {set.teamAScore}
                </Text>
                {" – "}
                <Text className={cn("text-sm", !aWon ? "font-extrabold" : "text-muted-foreground")}>
                  {set.teamBScore}
                </Text>
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
