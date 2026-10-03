import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

type IconButtonProps = Omit<PressableProps, "children"> & {
  /** Required: icon-only controls must be labelled for screen readers. */
  accessibilityLabel: string;
  children: React.ReactNode;
  className?: string;
};

/** 44×44 circular ghost button — the minimum comfortable tap target. */
function IconButton({ className, children, disabled, ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={4}
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full active:bg-muted",
        disabled && "opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export { IconButton };
