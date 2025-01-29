import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CardProps } from "./types";

export function Card({
  children,
  onPress,
  style,
  elevation = 1,
  ...props
}: CardProps) {
  const theme = useAppTheme();

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          shadowOpacity: elevation * 0.1,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...props}
      onPress={onPress}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 4,
  },
});
