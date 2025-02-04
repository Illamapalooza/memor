import React from "react";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}
