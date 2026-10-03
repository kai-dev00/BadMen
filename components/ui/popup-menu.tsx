import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export type PopupMenuItem = {
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  onPress: () => void;
};

type PopupMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: PopupMenuItem[];
  /** Optional read-only info lines shown above the actions. */
  info?: string[];
};

/** Menu anchored under the header (top-right) with a tap-outside backdrop. */
function PopupMenu({ visible, onClose, items, info }: PopupMenuProps) {
  const insets = useSafeAreaInsets();
  const { foreground, destructive } = useThemeColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1"
        onPress={onClose}
        accessibilityLabel="Close menu"
        accessibilityRole="button"
      >
        <View
          style={{ marginTop: insets.top + 56, marginRight: 16 }}
          className="min-w-[200px] max-w-[280px] self-end overflow-hidden rounded-2xl border border-border bg-popover shadow-lg shadow-black/20"
        >
          {info && info.length > 0 ? (
            <View className="gap-0.5 border-b border-border px-4 py-3">
              {info.map((line) => (
                <Text key={line} className="text-xs text-muted-foreground">
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
          {items.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
                className={cn(
                  "min-h-12 flex-row items-center gap-3 px-4 py-3 active:bg-muted",
                  index > 0 && "border-t border-border",
                )}
              >
                {ItemIcon ? (
                  <ItemIcon size={18} color={item.destructive ? destructive : foreground} />
                ) : null}
                <Text className={cn("text-sm", item.destructive && "text-destructive")}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

export { PopupMenu };
