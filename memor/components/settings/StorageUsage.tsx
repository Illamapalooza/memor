import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/services/auth/AuthProvider";
import { subscriptionLimits } from "@/utils/subscription-limits";
import { colors } from "@/utils/theme";
import { usePaywall } from "@/contexts/PaywallContext";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const StorageUsage = () => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const { showPaywall } = usePaywall();

  if (!userProfile) return null;

  const tier = userProfile.subscription?.tier || "basic";
  const storageLimit = subscriptionLimits[tier].storageLimit;
  const storageUsed = userProfile.usageLimits?.storageUsed || 0;
  const usagePercentage = Math.min((storageUsed / storageLimit) * 100, 100);

  const getStorageWarning = () => {
    if (usagePercentage >= 100) {
      return "Storage is full! Upgrade your plan to continue storing notes.";
    }
    if (usagePercentage > 90) {
      return "Storage almost full! Consider upgrading your plan.";
    }
    if (usagePercentage > 75) {
      return "Storage is filling up. Consider upgrading soon.";
    }
    return null;
  };

  const handleStoragePress = () => {
    if (usagePercentage >= 100) {
      showPaywall("storage");
    }
  };

  const warningText = getStorageWarning();

  return (
    <Pressable onPress={handleStoragePress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="subtitle1" style={{ color: theme.colors.primary }}>
            Storage Usage
          </Text>
          <Text variant="body" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
          </Text>
        </View>

        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.onSurface,
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${usagePercentage}%`,
                backgroundColor:
                  usagePercentage >= 100
                    ? theme.colors.error
                    : usagePercentage > 90
                    ? colors.jasper[300]
                    : theme.colors.primary,
              },
            ]}
          />
        </View>

        {warningText && (
          <Text
            variant="bodySmall"
            style={[
              styles.warningText,
              {
                color:
                  usagePercentage >= 100
                    ? theme.colors.error
                    : colors.jasper[300],
              },
            ]}
          >
            {warningText}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBarContainer: {
    height: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  warningText: {
    textAlign: "center",
  },
});
