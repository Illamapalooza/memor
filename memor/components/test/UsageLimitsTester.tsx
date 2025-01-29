import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "@/components/ui/Button";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/db/firebase";
import { UserProfile } from "@/utils/types/db";

export const UsageLimitsTester = () => {
  const { userProfile: initialProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!initialProfile?.id) return;

    // Listen for real-time updates to the user profile
    const unsubscribe = onSnapshot(
      doc(db, "users", initialProfile.id),
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        }
      }
    );

    return () => unsubscribe();
  }, [initialProfile?.id]);

  const simulateUsage = async (
    type: "aiQueries" | "audioRecordings" | "notes"
  ) => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    try {
      // Increment usage multiple times to hit limit
      for (let i = 0; i < 6; i++) {
        await UsageService.incrementUsage(userProfile.id, type);
      }
    } catch (error) {
      console.error("Error simulating usage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetLastPaywallShow = async () => {
    if (!userProfile?.id) return;
    // Set lastPaywallShow to 6 minutes ago to trigger time-based paywall
    const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
    await UsageService.updatePaywallShowTime(userProfile.id);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Usage Limits Tester
      </Text>

      <View style={styles.stats}>
        <Text>Current Usage:</Text>
        <Text>AI Queries: {userProfile?.usageLimits.aiQueriesUsed || 0}</Text>
        <Text>
          Audio Recordings: {userProfile?.usageLimits.audioRecordingsUsed || 0}
        </Text>
        <Text>Notes: {userProfile?.usageLimits.notesCreated || 0}</Text>
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          onPress={() => simulateUsage("aiQueries")}
          loading={isLoading}
        >
          Hit AI Limit
        </PrimaryButton>
        <PrimaryButton onPress={() => simulateUsage("audioRecordings")}>
          Hit Audio Limit
        </PrimaryButton>
        <PrimaryButton onPress={() => simulateUsage("notes")}>
          Hit Notes Limit
        </PrimaryButton>
        <PrimaryButton onPress={resetLastPaywallShow}>
          Trigger Time-based Paywall
        </PrimaryButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: "center",
  },
  stats: {
    gap: 8,
  },
  buttons: {
    gap: 12,
  },
});
