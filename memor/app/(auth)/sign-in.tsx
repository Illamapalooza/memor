import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { router } from "expo-router";
import { useAuthOperations } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, LinkButton } from "@/components/ui/Button";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SignInScreen() {
  const theme = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, error } = useAuthOperations();

  const handleSignIn = () => {
    signIn(email, password);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        Memor
      </Text>

      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Sign in to your account
      </Text>

      <Text
        variant="bodyLarge"
        style={[styles.description, { color: theme.colors.onSurface }]}
      >
        Sign in to your account to continue.
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
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <LinkButton
        onPress={() => router.push("/(auth)/reset-password")}
        style={styles.forgotPassword}
      >
        Forgot Password?
      </LinkButton>

      <PrimaryButton
        onPress={handleSignIn}
        loading={isLoading}
        style={styles.button}
        fullWidth
      >
        Sign In
      </PrimaryButton>
      <PrimaryButton
        loading={isLoading}
        style={styles.button}
        fullWidth
        size="large"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.background }}>
            Sign In with Google
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="logo-google"
            size={20}
            color={theme.colors.background}
            style={{ marginLeft: 8 }}
          />
        </View>
      </PrimaryButton>

      <View style={styles.footer}>
        <Text variant="bodyMedium">Don't have an account? </Text>
        <LinkButton onPress={() => router.push("/(auth)/sign-up")}>
          Sign Up
        </LinkButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginTop: 24,
    fontFamily: "Nunito-Bold",
  },
  description: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontFamily: "Nunito-Medium",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  link: {
    fontFamily: "Nunito-Medium",
  },
  error: {
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Nunito",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: "Nunito",
  },
});
