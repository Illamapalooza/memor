import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { subscriptionLimits } from "@/utils/subscription-limits";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import Ionicons from "@expo/vector-icons/Ionicons";

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  feature?: "aiQueries" | "audioRecordings" | "storage";
  permanent?: boolean;
};

export const PaywallModal = ({
  visible,
  onClose,
  feature,
  permanent,
}: PaywallModalProps) => {
  const theme = useAppTheme();
  const [showSubscriptionModal, setShowSubscriptionModal] =
    React.useState(false);

  const getFeatureLimit = () => {
    if (!feature) return "";
    switch (feature) {
      case "aiQueries":
        return `${subscriptionLimits.basic.aiQueriesTotal} AI queries`;
      case "audioRecordings":
        return `${subscriptionLimits.basic.audioRecordingsTotal} audio recordings`;
      case "storage":
        return `${subscriptionLimits.basic.storageLimit} storage`;
      default:
        return "";
    }
  };

  const getTitle = () => {
    if (permanent) {
      return "Usage Limit Reached";
    }
    return "Upgrade to Pro";
  };

  const getMessage = () => {
    if (permanent) {
      return `You've reached your free limit of ${getFeatureLimit()}. Upgrade to Pro for more access.`;
    }
    return "Get more access to all features and take your productivity to the next level.";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.content, { backgroundColor: theme.colors.background }]}
        >
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
          </Pressable>

          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            {getTitle()}
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.message, { color: theme.colors.onSurface }]}
          >
            {getMessage()}
          </Text>

          <View style={styles.features}>
            <Text
              variant="bodyMedium"
              style={[styles.featuresTitle, { color: theme.colors.onSurface }]}
            >
              Pro Features:
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              • 24 AI queries per day (1 query per hour)
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              • Unlimited audio recordings
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              • Up to 5 GB of storage
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              • Advanced features
            </Text>
          </View>

          <View style={styles.buttons}>
            <PrimaryButton
              onPress={() => setShowSubscriptionModal(true)}
              style={styles.button}
            >
              Upgrade Now
            </PrimaryButton>
            <OutlineButton onPress={onClose} style={styles.button}>
              Maybe Later
            </OutlineButton>
          </View>
        </View>
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          onClose();
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  title: {
    textAlign: "center",
    fontFamily: "Nunito-Bold",
    marginTop: 8,
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
  },
  features: {
    gap: 8,
    marginTop: 8,
  },
  featuresTitle: {
    fontFamily: "Nunito-Bold",
    marginBottom: 4,
  },
  buttons: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    width: "100%",
  },
});
