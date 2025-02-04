import { useTheme as useThemeContext } from "@/contexts/ThemeContext";

export const useAppTheme = () => {
  const { theme } = useThemeContext();
  return theme;
};
