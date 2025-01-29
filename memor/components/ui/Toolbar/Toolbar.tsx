import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/Text/Text";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";
import { AudioRecorder } from "../AudioRecorder/AudioRecorder";
import { AskAIModal } from "@/components/ai/AskAIModal";
import { usePaywall } from "@/contexts/PaywallContext";

export function Toolbar() {
  const [showRecorder, setShowRecorder] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { checkFeatureAccess, showPaywall } = usePaywall();

  const handleSaveRecording = async (uri: string) => {
    try {
      // Here you would typically:
      // 1. Upload the audio file
      // 2. Create a note with the audio attachment
      // 3. Close the recorder
      console.log("Recording saved at:", uri);
      setShowRecorder(false);
    } catch (error) {
      console.error("Failed to save recording:", error);
      Alert.alert("Error", "Failed to save recording. Please try again.");
    }
  };

  const handleAskAIPress = async () => {
    if (await checkFeatureAccess("aiQueries")) {
      setShowAIModal(true);
    } else {
      showPaywall("aiQueries");
    }
  };

  const handleRecordPress = async () => {
    if (await checkFeatureAccess("audioRecordings")) {
      setShowRecorder(true);
    } else {
      showPaywall("audioRecordings");
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleRecordPress}
        >
          <Ionicons name="mic" size={24} color={theme.colors.onSurface} />
          <Text variant="bodySmall">Record</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.aiButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleAskAIPress}
        >
          <Ionicons name="sparkles" size={24} color={theme.colors.surface} />
          <Text variant="bodySmall" style={{ color: theme.colors.surface }}>
            Ask your mind
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.push("/create")}
        >
          <Ionicons
            name="add-circle"
            size={24}
            color={theme.colors.onSurface}
          />
          <Text variant="bodySmall">Create</Text>
        </Pressable>
      </View>

      <AudioRecorder
        visible={showRecorder}
        onClose={() => setShowRecorder(false)}
        onSave={handleSaveRecording}
      />

      <AskAIModal visible={showAIModal} onClose={() => setShowAIModal(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.jasper.DEFAULT,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    alignItems: "center",
    gap: 4,
  },
  aiButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
  },
});
