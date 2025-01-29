import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/Text/Text";
import type { BadgeProps } from "./types";

export function Badge({
  children,
  variant = "default",
  size = "medium",
  style,
  ...props
}: BadgeProps) {
  const theme = useAppTheme();

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.surface,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
    },
    error: {
      backgroundColor: theme.colors.error,
      color: theme.colors.surface,
    },
    success: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.surface,
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    large: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 16,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        variantStyles[variant],
        {
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        style,
      ]}
      {...props}
    >
      <Text variant="caption" style={[{ color: variantStyles[variant].color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 99,
    alignSelf: "flex-start",
  },
});
