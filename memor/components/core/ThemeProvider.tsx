import React from "react";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { customLightTheme, customDarkTheme } from "@/utils/theme";

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <PaperProvider theme={isDark ? customDarkTheme : customLightTheme}>
      {children}
    </PaperProvider>
  );
}
