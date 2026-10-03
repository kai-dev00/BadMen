import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

function EmptyState({ icon: IconComponent, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { mutedForeground } = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <IconComponent size={28} color={mutedForeground} />
      </View>
      <Text className="text-center text-base font-semibold">{title}</Text>
      {subtitle ? (
        <Text className="text-center text-sm text-muted-foreground">{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-2" onPress={onAction}>
          <Text>{actionLabel}</Text>
        </Button>
      ) : null}
    </View>
  );
}

export { EmptyState };
