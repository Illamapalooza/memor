import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuthOperations } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
export default function ResetPasswordScreen() {
  const theme = useAppTheme();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = useAuthOperations();

  const handleResetPassword = async () => {
    await resetPassword(email);
    if (!error) {
      setIsSubmitted(true);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        Reset Password
      </Text>

      {isSubmitted ? (
        <View style={styles.successContainer}>
          <Text
            variant="bodyLarge"
            style={[styles.successText, { color: theme.colors.secondary }]}
          >
            If an account exists for {email}, you will receive an email with
            instructions to reset your password.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Button mode="contained" style={styles.button}>
              Return to Sign In
            </Button>
          </Link>
        </View>
      ) : (
        <>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurface }]}
          >
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          {error && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error.message}
            </Text>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            theme={{
              colors: {
                primary: theme.colors.primary,
                background: theme.colors.background,
              },
            }}
          />

          <PrimaryButton
            onPress={handleResetPassword}
            loading={isLoading}
            style={styles.button}
            disabled={!email.trim()}
          >
            Send Reset Instructions
          </PrimaryButton>

          <View style={styles.footer}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              Remember your password?{" "}
            </Text>
            <Link href="/(auth)/sign-in">
              <Text style={[styles.link, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#2196F3",
  },
  error: {
    color: "#B00020",
    textAlign: "center",
    marginBottom: 16,
  },
  successContainer: {
    alignItems: "center",
    gap: 24,
  },
  successText: {
    textAlign: "center",
    color: "#4CAF50",
  },
  header: {
    position: "absolute",
    top: 64,
    left: 16,
  },
});
