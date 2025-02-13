import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { PrimaryButton } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SubscriptionSuccessScreen() {
  const theme = useAppTheme();
  const { session_id } = useLocalSearchParams<{ session_id: string }>();

  useEffect(() => {
    // You could verify the session here if needed
    console.log("Subscription successful, session:", session_id);
  }, [session_id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <Ionicons
          name="checkmark-circle"
          size={64}
          color={theme.colors.primary}
        />
        <Text
          variant="h3"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Welcome to Pro!
        </Text>
        <Text
          variant="subtitle2"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Your subscription has been activated successfully.
        </Text>
        <PrimaryButton onPress={() => router.replace("/(app)")}>
          Continue to App
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    marginTop: 24,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
});
