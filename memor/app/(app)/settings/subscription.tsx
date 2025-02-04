import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

export default function SubscriptionScreen() {
  const theme = useAppTheme();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back-outline"
            size={20}
            color={theme.colors.primary}
          />
        </Pressable>
        <Text
          variant="subtitle2"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Subscription
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SubscriptionManager />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  title: {
    fontFamily: "Nunito-Bold",
  },
  backButton: {
    width: 40,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTitle: {
    fontFamily: "Nunito-Bold",
  },
  statusText: {
    opacity: 0.7,
  },
  warningText: {
    color: "#f59e0b",
  },
  manageButton: {
    marginTop: 8,
  },
  upgradeContainer: {
    gap: 24,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    flex: 1,
    gap: 4,
  },
  benefitDescription: {
    opacity: 0.7,
  },
  upgradeButton: {
    marginTop: 8,
  },
});
