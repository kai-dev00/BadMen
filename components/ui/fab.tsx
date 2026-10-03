import { Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";

type FabProps = {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Floating create button. Render inside a `relative flex-1` screen container. */
function Fab({ icon: IconComponent, onPress, accessibilityLabel }: FabProps) {
  const { primaryForeground } = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute bottom-6 right-4 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20 active:scale-95 active:bg-primary/90"
    >
      <IconComponent size={26} color={primaryForeground} />
    </Pressable>
  );
}

export { Fab };
