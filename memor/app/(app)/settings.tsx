import React from "react";
import {
  StyleSheet,
  View,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { useAuthOperations } from "@/hooks/useAuth";
import { useAuth } from "@/services/auth/AuthProvider";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";
import { SubscriptionTest } from "@/components/test/SubscriptionTest";
import { UsageLimitsTester } from "@/components/test/UsageLimitsTester";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const MenuItem = ({ icon, label, onPress }: MenuItemProps) => {
  const theme = useAppTheme();
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        {icon}
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
};

export default function SettingsScreen() {
  const theme = useAppTheme();
  const { logout } = useAuthOperations();
  const { userProfile } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.onSurfaceVariant}
            onPress={() => {
              router.back();
            }}
          />
          <View style={styles.profileSection}>
            <Ionicons name="person" size={80} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={styles.name}>
              {userProfile?.displayName}
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {userProfile?.email}
            </Text>
          </View>

          <SubscriptionManager />
          <Divider style={styles.divider} />

          <View style={styles.menuSection}>
            <MenuItem
              icon={
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              }
              label="Edit Profile"
              onPress={() => {
                /* handle edit profile */
              }}
            />
            <MenuItem
              icon={
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              }
              label="App Theme"
              onPress={() => {
                /* handle theme */
              }}
            />
            <MenuItem
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              }
              label="Notifications"
              onPress={() => {
                /* handle notifications */
              }}
            />
            <MenuItem
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              }
              label="Security"
              onPress={() => {
                /* handle security */
              }}
            />
            <MenuItem
              icon={
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={theme.colors.error}
                />
              }
              label="Log Out"
              onPress={logout}
            />
          </View>

          {/* <SubscriptionTest /> */}
          {/* {__DEV__ && <UsageLimitsTester />} */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  name: {
    fontFamily: "Nunito-Bold",
  },
  divider: {
    marginVertical: 16,
  },
  menuSection: {
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
