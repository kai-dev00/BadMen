import { ScrollView, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { ScoringSet } from "../types";

type ConcludedSummaryProps = {
  sideAName: string;
  sideBName: string;
  setsWonA: number;
  setsWonB: number;
  sets: ScoringSet[];
  createdLabel?: string | null;
  onRematch?: () => void;
};

export default function ConcludedSummary({
  sideAName,
  sideBName,
  setsWonA,
  setsWonB,
  sets,
  createdLabel,
  onRematch,
}: ConcludedSummaryProps) {
  const { primaryForeground } = useThemeColors();
  const winnerName =
    setsWonA === setsWonB ? null : setsWonA > setsWonB ? sideAName : sideBName;

  return (
    <ScrollView contentContainerClassName="gap-4 px-4 pb-6">
      <Card tonal className="items-center gap-2 p-5">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Trophy size={24} color={primaryForeground} />
        </View>
        <Text className="text-xs font-semibold uppercase text-muted-foreground">
          Match complete
        </Text>
        <Text className="text-center text-xl font-extrabold">
          {winnerName ? `${winnerName} wins` : "Draw"}
        </Text>
        <Text className="text-3xl font-extrabold" style={{ fontVariant: ["tabular-nums"] }}>
          {setsWonA} – {setsWonB}
        </Text>
        <Text className="text-center text-sm text-muted-foreground" numberOfLines={1}>
          {sideAName} vs {sideBName}
        </Text>
        {createdLabel ? <Text className="text-xs text-muted-foreground">{createdLabel}</Text> : null}
      </Card>

      <Card className="overflow-hidden">
        {sets.map((set, index) => {
          const aWon = set.teamAScore > set.teamBScore;
          return (
            <View
              key={set.setNumber}
              className={cn(
                "flex-row items-center px-4 py-3.5",
                index > 0 && "border-t border-border",
              )}
            >
              <Text className="w-24 text-sm text-muted-foreground">
                Set {set.setNumber}
              </Text>

              <Text
                className="flex-1 text-center text-base"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                <Text
                  className={cn(
                    "text-base",
                    aWon ? "font-extrabold" : "text-muted-foreground",
                  )}
                >
                  {set.teamAScore}
                </Text>

                {"  –  "}

                <Text
                  className={cn(
                    "text-base",
                    !aWon ? "font-extrabold" : "text-muted-foreground",
                  )}
                >
                  {set.teamBScore}
                </Text>
              </Text>

              <Text
                className="w-24 text-right text-xs text-muted-foreground"
                numberOfLines={1}
              >
                {aWon ? sideAName : sideBName}
              </Text>
            </View>
          );
        })}
      </Card>

      {onRematch ? (
        <Button className="h-12" onPress={onRematch}>
          <Text className="font-bold">Rematch</Text>
        </Button>
      ) : null}
    </ScrollView>
  );
}
