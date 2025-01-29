import React, { useState } from "react";
import { View, StyleSheet, Modal, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { SubscriptionService } from "@/services/subscription/subscription.service";

type SubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const SubscriptionModal = ({
  visible,
  onClose,
}: SubscriptionModalProps) => {
  const theme = useAppTheme();

  const handleSelectPlan = async (plan: "monthly" | "yearly") => {
    try {
      await SubscriptionService.startCheckout(plan);
      onClose();
    } catch (error) {
      console.error("Error starting checkout:", error);
      Alert.alert("Error", "Failed to start checkout. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="headlineSmall" style={styles.title}>
            Choose Your Plan
          </Text>
          <View style={styles.plans}>
            <View
              style={[
                styles.planCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text variant="titleLarge">Monthly</Text>
              <Text variant="headlineMedium">$9.99</Text>
              <Text variant="bodyMedium">per month</Text>
              <PrimaryButton
                onPress={() => handleSelectPlan("monthly")}
                style={styles.button}
              >
                Select Monthly
              </PrimaryButton>
            </View>
            <View
              style={[
                styles.planCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text variant="titleLarge">Yearly</Text>
              <Text variant="headlineMedium">$99.99</Text>
              <Text variant="bodyMedium">per year</Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary }}
              >
                Save 17%
              </Text>
              <PrimaryButton
                onPress={() => handleSelectPlan("yearly")}
                style={styles.button}
              >
                Select Yearly
              </PrimaryButton>
            </View>
          </View>
          <OutlineButton onPress={onClose} style={styles.closeButton}>
            Cancel
          </OutlineButton>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: "60%",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  plans: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    gap: 8,
  },
  button: {
    marginTop: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});
