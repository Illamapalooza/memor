import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { formatDate } from "@/utils/date";
import { useSubscription } from "@/hooks/useSubscription";
import {
  subscriptionService,
  UserSubscription,
} from "@/services/subscription/subscription.service";
import { SubscriptionModal } from "./SubscriptionModal";
import { SubscriptionService } from "@/services/subscription/subscription.service";
import { DEFAULT_SUBSCRIPTION } from "@/utils/defaults";

export const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const theme = useAppTheme();

  useEffect(() => {
    const loadSubscription = async () => {
      const sub = await SubscriptionService.getCurrentSubscription();
      setSubscription(sub || DEFAULT_SUBSCRIPTION);
    };

    loadSubscription();
  }, []);

  const isSubscribed = SubscriptionService.isSubscriptionActive(subscription);
  const isTrialing = subscription?.status === "trialing";
  const isCanceled = subscription?.status === "canceled";

  const getPlanTitle = () => {
    if (isTrialing) return "Pro Trial Plan";
    if (isSubscribed) return "Pro Plan";
    return "Free Plan";
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      "Cancel Subscription",
      isTrialing
        ? "Are you sure you want to cancel your trial? You'll lose access to pro features immediately."
        : "Are you sure you want to cancel your subscription? You'll still have access until the end of your current period.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await subscriptionService.cancelSubscription();
              Alert.alert(
                "Subscription Cancelled",
                isTrialing
                  ? "Your trial has been cancelled."
                  : "Your subscription has been cancelled. You'll have access until the end of your current period."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel subscription. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          {getPlanTitle()}
        </Text>
        {isTrialing && (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onPrimaryContainer }}
            >
              Trial
            </Text>
          </View>
        )}
      </View>

      {subscription && (
        <View style={styles.details}>
          {isTrialing && subscription.trialEnd && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              Trial ends: {formatDate(new Date(subscription.trialEnd * 1000))}
            </Text>
          )}
          {!isTrialing && subscription.currentPeriodEnd && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              Next billing date:{" "}
              {formatDate(new Date(subscription.currentPeriodEnd * 1000))}
            </Text>
          )}
          {isCanceled && subscription.currentPeriodEnd && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              Access expires:{" "}
              {formatDate(new Date(subscription.currentPeriodEnd * 1000))}
            </Text>
          )}
        </View>
      )}

      {!isSubscribed && !isTrialing && (
        <View style={styles.planDetails}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            Free Plan Features:
          </Text>
          <View style={styles.features}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              • Basic note-taking
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              • 5 AI queries per day
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              • Basic RAG features
            </Text>
          </View>
          <PrimaryButton
            onPress={() => setShowSubscriptionModal(true)}
            style={styles.button}
          >
            Upgrade to Pro
          </PrimaryButton>
        </View>
      )}

      {(isSubscribed || isTrialing) && !isCanceled && (
        <View style={styles.planDetails}>
          <Text variant="titleMedium">Pro Features:</Text>
          <View style={styles.features}>
            <Text variant="bodyMedium">• Unlimited note-taking</Text>
            <Text variant="bodyMedium">• Unlimited AI queries</Text>
            <Text variant="bodyMedium">• Advanced RAG features</Text>
          </View>
          {isTrialing && (
            <PrimaryButton
              onPress={() => setShowSubscriptionModal(true)}
              style={styles.button}
            >
              Upgrade to Pro
            </PrimaryButton>
          )}
          <OutlineButton
            onPress={handleCancelSubscription}
            style={styles.button}
          >
            {isTrialing ? "Cancel Trial" : "Cancel Subscription"}
          </OutlineButton>
        </View>
      )}

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontFamily: "Nunito-Bold",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  details: {
    marginBottom: 24,
  },
  planDetails: {
    gap: 16,
  },
  features: {
    gap: 8,
  },
  button: {
    marginTop: 16,
  },
});
