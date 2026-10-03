import React, { ReactNode, isValidElement, cloneElement } from "react";
import { ChevronLeft, X } from "lucide-react-native";
import { View } from "react-native";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  /** Extra pre-built actions (e.g. several IconButtons) shown at the right, before `rightContent`. */
  rightActions?: ReactNode;
  rightVariant?: "default" | "destructive";
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  /** When set, shows a cancel (X) button in place of back — used by selection mode. */
  onCancel?: () => void;
}

export default function Header({
  title,
  subtitle,
  rightContent,
  rightActions,
  rightVariant = "default",
  onRightPress,
  rightAccessibilityLabel,
  showBack,
  onBackPress,
  onCancel,
}: HeaderProps) {
  const { foreground, destructive } = useThemeColors();
  const rightColor = rightVariant === "destructive" ? destructive : foreground;

  const themedRightContent = isValidElement(rightContent)
    ? cloneElement(rightContent as React.ReactElement<{ color?: string }>, {
        color: rightColor,
      })
    : rightContent;

  return (
    <View className="min-h-14 flex-row items-center justify-between gap-2 px-4 py-1.5">
      <View className="flex-1 flex-row items-center gap-1">
        {onCancel ? (
          <IconButton onPress={onCancel} accessibilityLabel="Cancel selection" className="-ml-2">
            <X size={24} color={foreground} />
          </IconButton>
        ) : showBack ? (
          <IconButton onPress={onBackPress} accessibilityLabel="Go back" className="-ml-2">
            <ChevronLeft size={26} color={foreground} />
          </IconButton>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-bold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightActions || themedRightContent ? (
        <View className="-mr-2 flex-row items-center">
          {rightActions}
          {themedRightContent ? (
            <IconButton
              onPress={onRightPress}
              accessibilityLabel={rightAccessibilityLabel ?? "Action"}
            >
              {themedRightContent}
            </IconButton>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
