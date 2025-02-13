import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { List, Switch } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "@/services/auth/AuthProvider";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/utils/theme";
import { useTTS } from "@/hooks/useTTS";
import { useAuthOperations } from "@/hooks/useAuth";
import { StorageUsage } from "@/components/settings/StorageUsage";

type SettingItemProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
};

const SettingItem = ({
  title,
  subtitle,
  onPress,
  icon,
  rightElement,
}: SettingItemProps) => {
  const theme = useAppTheme();
  return (
    <List.Item
      title={title}
      titleStyle={{ color: theme.colors.onSurface }}
      description={subtitle}
      descriptionStyle={{ color: theme.colors.onSurface }}
      contentStyle={{
        justifyContent: "center",
      }}
      onPress={onPress}
      left={(props) => (
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      )}
      right={() => rightElement}
    />
  );
};

export default function SettingsScreen() {
  const theme = useAppTheme();
  const { logout } = useAuthOperations();
  const { userProfile } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { isTTSEnabled, toggleTTS } = useTTS();

  const handleBack = () => {
    router.back();
  };

  const handleThemeChange = (newMode: "light" | "dark" | "system") => {
    setThemeMode(newMode);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case "dark":
        return "moon";
      case "light":
        return "sunny";
      default:
        return "phone-portrait";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
        <Text variant="subtitle2" style={styles.title}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader
            style={[styles.subheader, { color: theme.colors.primary }]}
          >
            Account
          </List.Subheader>
          <SettingItem
            title="Edit Profile"
            icon="person"
            onPress={() => router.push("/settings/edit-profile")}
          />
          <SettingItem
            title="Subscription"
            icon="star"
            onPress={() => router.push("/settings/subscription")}
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[styles.subheader, { color: theme.colors.primary }]}
          >
            Preferences
          </List.Subheader>
          <SettingItem
            title="Theme"
            subtitle={
              themeMode === "system"
                ? "System"
                : themeMode === "dark"
                ? "Dark"
                : "Light"
            }
            icon={getThemeIcon()}
            onPress={() => {
              const modes: ("light" | "dark" | "system")[] = [
                "light",
                "dark",
                "system",
              ];
              const currentIndex = modes.indexOf(themeMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              handleThemeChange(nextMode);
            }}
          />
          <SettingItem
            title="Text-to-Speech"
            icon="volume-high"
            rightElement={
              <Switch
                value={isTTSEnabled}
                onValueChange={toggleTTS}
                style={{ marginRight: 8 }}
                color={theme.colors.primary}
              />
            }
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[styles.subheader, { color: theme.colors.primary }]}
          >
            Legal
          </List.Subheader>
          <SettingItem
            title="Privacy Policy"
            icon="shield"
            onPress={() => router.push("/settings/privacy-policy")}
          />
          <SettingItem
            title="Terms of Service"
            icon="document-text"
            onPress={() => router.push("/settings/terms")}
          />
        </List.Section>
        <StorageUsage />

        <List.Section>
          <SettingItem title="Sign Out" icon="log-out" onPress={logout} />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  title: {
    fontFamily: "Nunito-Bold",
    color: colors.jasper.DEFAULT,
  },
  backButton: {
    width: 40,
  },
  subheader: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
  },
  listItem: {
    borderRadius: 4,
    padding: 16,
  },
});
