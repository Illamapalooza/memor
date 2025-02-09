import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, Pressable } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { router } from "expo-router";
import { useAuthOperations } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, LinkButton } from "@/components/ui/Button";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/contexts/ThemeContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignInScreen() {
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, error } = useAuthOperations();

  const handleSignIn = () => {
    signIn(email, password);
  };

  const toggleTheme = () => {
    const modes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case "dark":
        return "moon";
      case "light":
        return "sunny";
      default:
        return "phone-portrait";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <Pressable onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons
            name={getThemeIcon()}
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
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

        <LinkButton
          onPress={() => router.push("/(auth)/reset-password")}
          style={styles.forgotPassword}
        >
          Forgot Password?
        </LinkButton>

        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: theme.colors.outline },
            ]}
          />
          <Text
            style={[
              styles.dividerText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            or
          </Text>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: theme.colors.outline },
            ]}
          />
        </View>

        <GoogleSignInButton />

        <PrimaryButton
          onPress={handleSignIn}
          loading={isLoading}
          style={styles.button}
          fullWidth
        >
          Sign In
        </PrimaryButton>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Don't have an account?{" "}
          </Text>
          <LinkButton onPress={() => router.push("/(auth)/sign-up")}>
            Sign Up
          </LinkButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  themeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 64,
    left: 16,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
});
