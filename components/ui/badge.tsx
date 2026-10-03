import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { LucideIcon } from "lucide-react-native";

const badgeVariants = cva("flex-row items-center justify-center self-start rounded-full px-2.5 py-1", {
  variants: {
    variant: {
      muted: "bg-muted",
      outline: "border border-border",
      primary: "bg-primary",
      success: "bg-success",
      live: "bg-destructive/15",
      done: "bg-success/15",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: { variant: "muted" },
});

const badgeTextVariants = cva("text-[11px] font-semibold", {
  variants: {
    variant: {
      muted: "text-muted-foreground",
      outline: "text-muted-foreground",
      primary: "text-primary-foreground",
      success: "text-success-foreground",
      live: "text-destructive",
      done: "text-success",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "muted" },
});

type BadgeProps = VariantProps<typeof badgeVariants> & {
  label: string;
  /** When set, the badge shows only this icon (label is used for accessibility). */
  icon?: LucideIcon;
  className?: string;
};

function Badge({ label, icon: Icon, variant, className }: BadgeProps) {
  const colors = useThemeColors();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (variant !== "live") return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, variant]);

  if (Icon) {
    const iconColor =
      variant === "live"
        ? colors.destructive
        : variant === "done"
          ? colors.success
        : variant === "primary"
          ? colors.primaryForeground
          : variant === "success"
            ? colors.successForeground
            : variant === "destructive"
              ? colors.destructiveForeground
              : colors.mutedForeground;

    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={label}
        className={cn(badgeVariants({ variant }), "size-7 self-center justify-center px-0 py-0", className)}
      >
        <Animated.View style={variant === "live" ? { opacity: pulse } : undefined}>
          <Icon size={15} color={iconColor} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      {variant === "live" && (
        <Animated.View
          className="mr-1.5 h-1.5 w-1.5 rounded-full bg-destructive"
          style={{ opacity: pulse }}
        />
      )}
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  );
}

export { Badge };
export type { BadgeProps };
