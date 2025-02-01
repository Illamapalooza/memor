import { Stack } from "expo-router";
import { useAuth } from "@/services/auth/AuthProvider";
import { Redirect } from "expo-router";
import { EmailVerificationBanner } from "@/components/core/EmailVerificationBanner";

export default function SettingsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-profile"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          headerShown: false,
          title: "Subscription",
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="terms"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
