import { Stack } from "expo-router";
import { useAuth } from "@/services/auth/AuthProvider";
import { Redirect } from "expo-router";
import { EmailVerificationBanner } from "@/components/core/EmailVerificationBanner";
import { ThemedStatusBar } from "@/components/core/ThemedStatusBar";
import React from "react";

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <>
      <ThemedStatusBar />
      <Stack>
        <EmailVerificationBanner />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="create"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="note/[id]"
          options={{
            headerShown: false,
            title: "Note Details",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
