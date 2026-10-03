import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import { Platform, TextInput, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export type InputProps = React.ComponentProps<typeof TextInput> &
  React.RefAttributes<TextInput> & {
    icon?: LucideIcon;
  };

function Input({ className, icon: LeadingIcon, ...props }: InputProps) {
  const { mutedForeground } = useThemeColors();

  const input = (
    <TextInput
      placeholderTextColor={mutedForeground}
      className={cn(
        "border-input bg-muted/40 text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 focus:border-ring sm:h-9",
        LeadingIcon && "pl-10",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            }),
          ),
        Platform.select({
          web: cn(
            "selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          ),
        }),
        className,
      )}
      {...props}
    />
  );

  if (!LeadingIcon) return input;

  return (
    <View className="relative justify-center">
      {input}
      <View className="absolute left-3">
        <Icon as={LeadingIcon} size={18} className="text-muted-foreground" />
      </View>
    </View>
  );
}

export { Input };
