import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type CardProps = ViewProps & {
  /** Use the tonal-surface token for emphasis (selected rows, banners). */
  tonal?: boolean;
};

function Card({ className, tonal, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-border",
        tonal ? "bg-tonal-surface" : "bg-card",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
