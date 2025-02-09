import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/services/auth/AuthProvider";
import Ionicons from "@expo/vector-icons/Ionicons";

export function GoogleSignInButton() {
  const theme = useAppTheme();
  const { signInWithGoogle } = useAuth();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
      onPress={signInWithGoogle}
    >
      <Ionicons name="logo-google" size={24} color={theme.colors.onSurface} />
      <Text style={[styles.text, { color: theme.colors.onSurface }]}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: "Nunito-Medium",
  },
});
