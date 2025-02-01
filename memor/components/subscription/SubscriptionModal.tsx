import React, { useState } from "react";
import { View, StyleSheet, Modal, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { SubscriptionService } from "@/services/subscription/subscription.service";
import Ionicons from "@expo/vector-icons/Ionicons";

type SubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const SubscriptionModal = ({
  visible,
  onClose,
}: SubscriptionModalProps) => {
  const theme = useAppTheme();
  const [showPlans, setShowPlans] = useState(false);

  const handleSelectPlan = async (plan: "monthly" | "yearly") => {
    try {
      await SubscriptionService.startCheckout(plan);
      onClose();
    } catch (error) {
      console.error("Error starting checkout:", error);
      Alert.alert("Error", "Failed to start checkout. Please try again.");
    }
  };

  const BenefitsScreen = () => (
    <View style={styles.benefitsContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Upgrade to Pro
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Unlock the full potential of your mind
      </Text>

      <View style={styles.benefitsList}>
        <BenefitItem
          icon="sparkles-outline"
          title="AI-Powered Second Brain"
          description="Get intelligent analysis and connections across your notes"
        />
        <BenefitItem
          icon="planet-outline"
          title="Bigger Brain"
          description="Bigger storage for your notes. Up to 10GB"
        />
        <BenefitItem
          icon="search-outline"
          title="Advanced Search"
          description="Find anything instantly with powerful search capabilities"
        />
        <BenefitItem
          icon="cloud-upload-outline"
          title="Cloud Sync"
          description="Access your notes across all your devices"
        />
      </View>

      <View style={styles.actionButtons}>
        <PrimaryButton onPress={() => setShowPlans(true)} style={styles.button}>
          Continue
        </PrimaryButton>
        <OutlineButton onPress={onClose} style={styles.button}>
          Maybe Later
        </OutlineButton>
      </View>
    </View>
  );

  const PlansScreen = () => (
    <View style={styles.plansContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Choose Your Plan
      </Text>
      <View style={styles.plans}>
        <View
          style={[
            styles.planCard,
            {
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text variant="titleLarge">Monthly</Text>
          <Text variant="headlineMedium">$9.99</Text>
          <Text variant="bodyMedium">per month</Text>
          <View style={{ justifyContent: "flex-end", flex: 1 }}>
            <PrimaryButton
              onPress={() => handleSelectPlan("monthly")}
              style={[styles.button]}
            >
              Select Monthly
            </PrimaryButton>
          </View>
        </View>
        <View
          style={[
            styles.planCard,
            {
              borderWidth: 2,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text variant="titleLarge">Yearly</Text>
          <Text variant="headlineMedium">$99.99</Text>
          <Text variant="bodyMedium">per year</Text>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
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
      <OutlineButton
        onPress={() => setShowPlans(false)}
        style={styles.backButton}
      >
        Back
      </OutlineButton>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {showPlans ? <PlansScreen /> : <BenefitsScreen />}
        </View>
      </View>
    </Modal>
  );
};

type BenefitItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const BenefitItem = ({ icon, title, description }: BenefitItemProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.benefitItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Ionicons name={icon} size={24} color={theme.colors.surface} />
      </View>
      <View style={styles.benefitText}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  benefitsContainer: {
    gap: 16,
  },
  plansContainer: {
    gap: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 24,
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
  plans: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    width: "100%",
    textAlign: "center",
  },
  backButton: {
    marginTop: 8,
  },
});
