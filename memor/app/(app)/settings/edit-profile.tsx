import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { TextInput } from "react-native-paper";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/Text/Text";
import { PrimaryButton } from "@/components/ui/Button";
import { useAuth } from "@/services/auth/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";

export default function EditProfileScreen() {
  const theme = useAppTheme();
  const { userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await updateUserProfile({
        displayName: name.trim(),
      });
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="chevron-back-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
          <Text variant="subtitle2" style={styles.title}>
            Edit Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <TextInput
            mode="outlined"
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.blackOlive[800]}
          />

          <PrimaryButton
            onPress={handleSave}
            loading={isLoading}
            disabled={!name.trim() || name.trim() === userProfile?.displayName}
            style={styles.saveButton}
          >
            Save Changes
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
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
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  saveButton: {
    marginTop: 24,
  },
});
