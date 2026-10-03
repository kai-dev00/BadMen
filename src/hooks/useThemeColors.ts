import { useColorScheme } from "nativewind";
import { THEME } from "@/lib/theme";

/** Token colors (from global.css) for APIs that can't use className. */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return { isDark, ...THEME[isDark ? "dark" : "light"] };
}
