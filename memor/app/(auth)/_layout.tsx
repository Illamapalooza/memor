import { Stack } from "expo-router";
import { useAuth } from "@/services/auth/AuthProvider";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
