import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuthOperations } from "@/hooks/useAuth";
import { passwordValidation } from "@/utils/validation";
import { PasswordStrengthIndicator } from "@/components/core/PasswordStrengthIndicator";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LinkButton, PrimaryButton } from "@/components/ui/Button";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const theme = useAppTheme();
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { signUp, isLoading, error } = useAuthOperations();
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      !!email.trim() &&
        !!displayName.trim() &&
        passwordValidation.isValid(password)
    );
  }, [email, password, displayName]);

  const handleSignUp = () => {
    signUp(email, password, displayName);
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
        Create an account
      </Text>

      <Text
        variant="bodyLarge"
        style={[styles.description, { color: theme.colors.onSurface }]}
      >
        Join Memor for free. Effortlessly build your second brain.
      </Text>

      {error && <Text style={styles.error}>{error.message}</Text>}

      <TextInput
        label="Name"
        value={displayName}
        onChangeText={setDisplayName}
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

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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

      <PasswordStrengthIndicator password={password} />

      <PrimaryButton
        onPress={handleSignUp}
        loading={isLoading}
        style={styles.button}
        disabled={!isFormValid}
      >
        Sign Up
      </PrimaryButton>

      <PrimaryButton
        loading={isLoading}
        style={styles.button}
        fullWidth
        size="large"
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.background }}>
            Sign Up with Google
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
        <Text style={{ color: theme.colors.onSurface }}>
          Already have an account?{" "}
        </Text>
        <LinkButton onPress={() => router.push("/(auth)/sign-in")}>
          Sign In
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
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    alignItems: "center",
  },
  link: {
    color: "#2196F3",
  },
  error: {
    color: "#B00020",
    textAlign: "center",
    marginBottom: 16,
  },
});
