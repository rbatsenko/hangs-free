import { useTheme } from "@/contexts/ThemeContext";

export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
