import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/services/auth/AuthProvider";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { OutlineButton } from "@/components/ui/Button";
import { useAuthOperations } from "@/hooks/useAuth";
import { colors } from "@/utils/theme";

type SettingItemProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
};

const SettingItem = ({
  title,
  subtitle,
  onPress,
  icon,
  rightText,
}: SettingItemProps) => {
  const theme = useAppTheme();

  return (
    <Pressable style={[styles.settingItem]} onPress={onPress}>
      <View style={styles.settingContent}>
        <View style={styles.settingMain}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={theme.colors.primary}
              style={styles.settingIcon}
            />
          )}
          <View style={styles.settingTexts}>
            <Text
              variant="body"
              style={{ color: theme.colors.primary, fontFamily: "Nunito-Bold" }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                variant="bodySmall"
                style={[styles.settingValue, { color: theme.colors.onSurface }]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {rightText && (
            <Text
              variant="bodySmall"
              style={[styles.settingRightText, { color: theme.colors.primary }]}
            >
              {rightText}
            </Text>
          )}
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color={theme.colors.primary}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const theme = useAppTheme();
  const { logout } = useAuthOperations();
  const { userProfile } = useAuth();

  const navigateToEditProfile = () => {
    router.push("/settings/edit-profile");
  };

  const navigateToSubscription = () => {
    router.push("/settings/subscription");
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text variant="subtitle1" style={styles.sectionTitle}>
            Profile
          </Text>
          <SettingItem
            title="Edit Profile"
            subtitle={userProfile?.displayName}
            onPress={navigateToEditProfile}
            icon="person-outline"
          />
        </View>

        <View style={styles.section}>
          <Text variant="subtitle1" style={styles.sectionTitle}>
            Preferences
          </Text>
          <SettingItem
            title="Appearance"
            subtitle="Dark mode"
            onPress={() => {}}
            icon="color-palette-outline"
          />
          {/* <SettingItem
            title="Notifications"
            subtitle="Manage notifications"
            onPress={() => {}}
            icon="notifications-outline"
          /> */}
        </View>

        <View style={styles.section}>
          <Text variant="subtitle1" style={styles.sectionTitle}>
            Account
          </Text>
          <SettingItem
            title="Subscription"
            subtitle={
              userProfile?.subscription?.status === "active" ? "Pro" : "Free"
            }
            onPress={navigateToSubscription}
            icon="diamond-outline"
          />
          {/* <SettingItem
            title="Storage"
            subtitle="Check your storage usage"
            onPress={() => {}}
            icon="cloud-outline"
            rightText="2.1 GB"
          /> */}
        </View>

        <View style={styles.section}>
          <Text variant="subtitle1" style={styles.sectionTitle}>
            Support
          </Text>
          {/* <SettingItem
            title="Help & Support"
            subtitle="Get help with Memor"
            onPress={() => {}}
            icon="help-circle-outline"
          /> */}
          <SettingItem
            title="Privacy Policy"
            onPress={() => router.push("/settings/privacy-policy")}
            icon="shield-outline"
          />
          <SettingItem
            title="Terms of Service"
            onPress={() => router.push("/settings/terms")}
            icon="document-text-outline"
          />
        </View>

        <View style={[styles.section, styles.signOutSection]}>
          <OutlineButton onPress={handleSignOut} style={styles.signOutButton}>
            <View style={styles.signOutIcon}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.signOutText}>
              <Text
                variant="body"
                style={{
                  color: theme.colors.primary,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Sign Out
              </Text>
            </View>
          </OutlineButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontFamily: "Nunito-Bold",
    color: colors.jasper.DEFAULT,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.jasper.DEFAULT,
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTexts: {
    flex: 1,
    color: colors.jasper.DEFAULT,
  },
  settingValue: {
    color: colors.jasper.DEFAULT,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingRightText: {
    color: colors.jasper.DEFAULT,
  },
  signOutSection: {
    marginTop: 16,
  },
  signOutButton: {
    width: "100%",
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  signOutIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
