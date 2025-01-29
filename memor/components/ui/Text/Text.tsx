import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { TextProps } from "./types";

export function Text({
  variant = "body",
  color,
  align = "left",
  children,
  style,
  ...props
}: TextProps) {
  const theme = useAppTheme();

  const variantStyles = {
    h1: {
      fontFamily: "Nunito-Bold",
      fontSize: 32,
      lineHeight: 40,
    },
    h2: {
      fontFamily: "Nunito-Bold",
      fontSize: 28,
      lineHeight: 36,
    },
    h3: {
      fontFamily: "Nunito-Bold",
      fontSize: 24,
      lineHeight: 32,
    },
    subtitle1: {
      fontFamily: "Nunito-Medium",
      fontSize: 20,
      lineHeight: 28,
    },
    subtitle2: {
      fontFamily: "Nunito-Medium",
      fontSize: 18,
      lineHeight: 26,
    },
    body: {
      fontFamily: "Nunito",
      fontSize: 16,
      lineHeight: 24,
    },
    bodySmall: {
      fontFamily: "Nunito",
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontFamily: "Nunito",
      fontSize: 12,
      lineHeight: 16,
    },
  };

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        {
          color: color ?? theme.colors.onSurfaceVariant,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 1,
  },
});
