import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, Banner } from "react-native-paper";
import { useAuthOperations } from "@/hooks/useAuth";
import { useAuth } from "@/services/auth/AuthProvider";
import { useAppTheme } from "@/hooks/useAppTheme";

export function EmailVerificationBanner() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const { sendVerificationEmail, isLoading, error } = useAuthOperations();

  if (!user || user.emailVerified) {
    return null;
  }

  return (
    <Banner
      visible={true}
      actions={[
        {
          label: "Resend Email",
          onPress: sendVerificationEmail,
          loading: isLoading,
        },
      ]}
      icon="email"
      style={{ backgroundColor: theme.colors.surfaceVariant }}
    >
      <View style={styles.content}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Please verify your email address to access all features.
        </Text>
        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error.message}
          </Text>
        )}
      </View>
    </Banner>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 4,
  },
  error: {
    fontFamily: "Nunito",
  },
});
