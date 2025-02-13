import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { PrimaryButton } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SubscriptionCancelScreen() {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <Ionicons name="close-circle" size={64} color={theme.colors.error} />
        <Text
          variant="h3"
          style={[styles.title, { color: theme.colors.error }]}
        >
          Subscription Cancelled
        </Text>
        <Text
          variant="subtitle2"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Your subscription was not completed. You can try again anytime.
        </Text>
        <PrimaryButton onPress={() => router.replace("/(app)")}>
          Return to App
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
