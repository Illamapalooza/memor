import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { DividerProps } from "./types";

export function Divider({
  orientation = "horizontal",
  style,
  color,
  ...props
}: DividerProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        orientation === "vertical" ? styles.vertical : styles.horizontal,
        { backgroundColor: color ?? theme.colors.surfaceVariant },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
  },
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: "100%",
  },
});
