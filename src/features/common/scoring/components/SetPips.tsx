import { View } from "react-native";
import { cn } from "@/lib/utils";

/** One pip per set needed to win the match; filled pips are sets already won. */
export default function SetPips({
  won,
  total,
  className,
}: {
  won: number;
  total: number;
  className?: string;
}) {
  return (
    <View
      className={cn("flex-row items-center gap-1.5", className)}
      accessible
      accessibilityLabel={`${won} of ${total} sets won`}
    >
      {Array.from({ length: Math.max(total, 1) }, (_, index) => (
        <View
          key={index}
          className={cn(
            "h-2.5 w-2.5 rounded-full border",
            index < won ? "border-primary bg-primary" : "border-border bg-muted",
          )}
        />
      ))}
    </View>
  );
}
