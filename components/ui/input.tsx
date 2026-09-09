import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import { Platform, TextInput, View } from "react-native";

// type InputProps = React.ComponentProps<typeof TextInput> &
//   React.RefAttributes<TextInput> & {
//     icon?: LucideIcon;
//   };

  export type InputProps = React.ComponentProps<typeof TextInput> &
    React.RefAttributes<TextInput> & {
      icon?: LucideIcon;
  };

function Input({ className, icon: Icon, ...props }: InputProps) {
  const input = (
    <TextInput
      className={cn(
        "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
        Icon && "pl-10",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            }),
          ),
        Platform.select({
          web: cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          ),
          native: "placeholder:text-muted-foreground/50",
        }),
        className,
      )}
      {...props}
    />
  );

  if (!Icon) return input;

  return (
    <View className="relative justify-center">
      {input}
      <View className="absolute left-3">
        <Icon size={18} className="text-muted-foreground" />
      </View>
    </View>
  );
}

export { Input };
