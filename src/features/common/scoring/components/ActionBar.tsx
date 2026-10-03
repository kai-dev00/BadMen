import { View } from "react-native";
import { RotateCcw, Undo2 } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/src/hooks/useThemeColors";

type ActionBarProps = {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  canEndSet: boolean;
  onEndSet: () => void;
  endLabel: string;
  compact?: boolean;
};

/** Undo · Reset · End set. End set only turns lime once the set is actually won. */
export default function ActionBar({
  canUndo,
  onUndo,
  onReset,
  canEndSet,
  onEndSet,
  endLabel,
  compact = false,
}: ActionBarProps) {
  const { foreground } = useThemeColors();
  const height = compact ? "h-11" : "h-12";

  return (
    <View className="flex-row items-center gap-2">
      <Button
        variant="outline"
        className={cn(height, "px-3")}
        onPress={onUndo}
        disabled={!canUndo}
        accessibilityLabel="Undo last point"
      >
        <Undo2 size={18} color={foreground} />
        <Text>Undo</Text>
      </Button>
      <Button
        variant="outline"
        className={cn(height, "px-3")}
        onPress={onReset}
        accessibilityLabel="Reset set"
      >
        <RotateCcw size={16} color={foreground} />
        <Text>Reset</Text>
      </Button>
      <Button
        variant={canEndSet ? "default" : "secondary"}
        className={cn(height, "flex-1")}
        onPress={onEndSet}
        disabled={!canEndSet}
        accessibilityLabel={endLabel}
      >
        <Text className={cn("font-bold", !canEndSet && "text-muted-foreground")} numberOfLines={1}>
          {endLabel}
        </Text>
      </Button>
    </View>
  );
}
