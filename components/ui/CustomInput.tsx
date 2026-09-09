import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { Input, InputProps,  } from "./input";

type CustomInputProps = InputProps & {
  label?: string;
  error?: string;
  labelPosition?: "top" | "left";
  errorPosition?: "bottom" | "right";
};

function CustomInput({
  label,
  error,
  labelPosition = "top",
  errorPosition = "bottom",
  className,
  ...props
}: CustomInputProps) {
  const isHorizontal = labelPosition === "left";

  return (
    <View
      className={cn(
        isHorizontal ? "flex-row items-center gap-3" : "gap-1",
      )}
    >
      {label && (
        <View
          className={cn(
            "flex-row items-center justify-between",
            isHorizontal && "min-w-24",
          )}
        >
          <Text className="text-sm text-foreground">
            {label}
          </Text>

          {error && errorPosition === "right" && (
            <Text className="ml-2 text-sm text-destructive">
              {error}
            </Text>
          )}
        </View>
      )}

      <View
        className={cn(
          isHorizontal && "flex-1",
        )}
      >
        <Input
          {...props}
          className={cn(
            error && "border-destructive",
            className,
          )}
        />

        {error && errorPosition === "bottom" && (
          <Text className="mt-1 text-sm text-destructive">
            {error}
          </Text>
        )}
      </View>
    </View>
  );
}

export { CustomInput };
export type { CustomInputProps };