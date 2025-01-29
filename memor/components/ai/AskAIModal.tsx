import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  Alert,
  Clipboard,
} from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { TextInput } from "react-native-paper";
import { AudioRecorder } from "../ui/AudioRecorder/AudioRecorder";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { PaywallGuard } from "@/components/core/PaywallGuard";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SUGGESTED_QUESTIONS = [
  "Summarize my recent notes",
  "Find notes about meetings",
  "What are my main tasks?",
  "Analyze my writing style",
];

const SIMULATED_RESPONSE = `I've analyzed your notes and found several interesting patterns:

1. Meeting Notes:
   - You have 5 meeting notes from the past week
   - Most meetings are scheduled between 10 AM and 2 PM
   - Common participants: Sarah, Mike, and Team Lead

2. Task Patterns:
   - 12 pending tasks identified
   - Most tasks are related to project planning
   - 3 high-priority items marked for this week

3. Writing Style Analysis:
   - Clear and concise documentation
   - Technical terms frequently used
   - Average note length: 250 words

Would you like me to elaborate on any of these aspects or help you organize your tasks?`;

export function AskAIModal({ visible, onClose }: Props) {
  const { userProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const theme = useAppTheme();

  // Animation values
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const modalTranslateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const simulateStreamingResponse = useCallback((fullResponse: string) => {
    let index = 0;
    setStreamedResponse("");

    const interval = setInterval(() => {
      if (index < fullResponse.length) {
        setStreamedResponse((prev) => prev + fullResponse[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 20); // Adjust speed as needed

    return () => clearInterval(interval);
  }, []);

  const handleAskAI = async () => {
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);

      // Track usage before making the request
      await UsageService.incrementUsage(userProfile.id, "aiQueries");

      if (!query.trim()) return;

      setResponse("streaming");
      simulateStreamingResponse(SIMULATED_RESPONSE);
    } catch (error) {
      console.error("Error in AI query:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResponse(null);
    setStreamedResponse("");
    setIsLoading(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setQuery(question);
    handleAskAI();
  };

  const handleAudioSave = async (uri: string) => {
    setShowRecorder(false);
    setIsLoading(true);
    setQuery("Transcribed audio query...");
    setResponse("streaming");
    simulateStreamingResponse(
      "I've processed your audio query and analyzed your notes. Here are the key findings..."
    );
  };

  const handleCopyResponse = async () => {
    try {
      await Clipboard.setString(streamedResponse);
      Alert.alert("Copied", "Response copied to clipboard");
    } catch (error) {
      console.error("Failed to copy response:", error);
      Alert.alert("Error", "Failed to copy response");
    }
  };

  return (
    <PaywallGuard feature="aiQueries">
      <Modal visible={visible} transparent animationType="none">
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          >
            <Pressable style={styles.dismissArea} onPress={onClose} />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                transform: [{ translateY: modalTranslateY }],
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons
                  name="sparkles"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="subtitle1">What can I help you with?</Text>
              </View>
              <View style={styles.headerButtons}>
                {response && (
                  <Pressable onPress={handleReset} style={styles.resetButton}>
                    <IconSymbol
                      name="arrow.counterclockwise"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </Pressable>
                )}
                <Pressable onPress={onClose}>
                  <IconSymbol
                    name="xmark"
                    size={20}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.content}>
              {!response && (
                <View style={styles.suggestedQuestions}>
                  <Text variant="subtitle2">Suggested Questions</Text>
                  <View style={styles.questionsList}>
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <OutlineButton
                        key={index}
                        onPress={() => handleSuggestedQuestion(question)}
                        size="small"
                      >
                        {question}
                      </OutlineButton>
                    ))}
                  </View>
                </View>
              )}

              {response && (
                <ScrollView
                  style={styles.responseContainer}
                  contentContainerStyle={styles.responseContent}
                >
                  <View style={styles.responseHeader}>
                    <Text variant="caption" style={styles.responseLabel}>
                      Response
                    </Text>
                    <Pressable
                      onPress={handleCopyResponse}
                      style={({ pressed }) => [
                        styles.copyButton,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={16}
                        color={colors.blackOlive[700]}
                      />
                    </Pressable>
                  </View>
                  <Text variant="body">{streamedResponse}</Text>
                  {isLoading && (
                    <View style={styles.cursor}>
                      <Text variant="body">|</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Ask anything about your notes..."
                  multiline
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon="microphone"
                      onPress={() => setShowRecorder(true)}
                    />
                  }
                />
                <PrimaryButton
                  onPress={handleAskAI}
                  loading={isLoading}
                  disabled={!query.trim() || isLoading}
                >
                  Ask
                </PrimaryButton>
              </View>
            </View>
          </Animated.View>
        </View>

        <AudioRecorder
          visible={showRecorder}
          onClose={() => setShowRecorder(false)}
          onSave={handleAudioSave}
        />
      </Modal>
    </PaywallGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  resetButton: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    gap: 24,
  },
  suggestedQuestions: {
    gap: 12,
  },
  questionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  responseContainer: {
    flex: 1,
    backgroundColor: colors.babyPowder.DEFAULT,
    borderRadius: 12,
    maxHeight: 400,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  responseLabel: {
    opacity: 0.7,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  responseContent: {
    padding: 16,
  },
  cursor: {
    height: 24,
    justifyContent: "center",
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: "transparent",
  },
});
