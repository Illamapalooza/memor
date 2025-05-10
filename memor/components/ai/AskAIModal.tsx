import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  Alert,
  Clipboard,
  Easing,
} from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { Text } from "../ui/Text/Text";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { AudioRecorder } from "../ui/AudioRecorder/AudioRecorder";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { PaywallGuard } from "@/components/core/PaywallGuard";
import { useAIQuery } from "@/hooks/useAIQuery";
import { IconButton } from "@/components/ui/Button/Button";
import { useTTS } from "@/hooks/useTTS";
import { useAppTheme } from "@/hooks/useAppTheme";

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

export const AskAIModal = ({ visible, onClose }: Props) => {
  const theme = useAppTheme();
  const { dark } = useTheme();
  const { userProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [relevantNotes, setRelevantNotes] = useState<any[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const { queryAI, isLoading, error, cancelQuery } = useAIQuery();
  const [streamController, setStreamController] =
    useState<AbortController | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const { speak, stop, isPlaying, isTTSEnabled, toggleTTS } = useTTS();

  const modalTranslateY = React.useRef(new Animated.Value(1000)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  // Add animation values for the loading indicator
  const thinkingDotsAnim = useRef(new Animated.Value(0)).current;
  const thinkingScale = useRef(new Animated.Value(0)).current;
  const thinkingRotate = useRef(new Animated.Value(0)).current;
  const thinkingBubble1 = useRef(new Animated.Value(0)).current;
  const thinkingBubble2 = useRef(new Animated.Value(0)).current;
  const thinkingBubble3 = useRef(new Animated.Value(0)).current;

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

  // Setup animations for the thinking indicators
  useEffect(() => {
    if (isLoading || isProcessingAudio) {
      // Start scale animation
      thinkingScale.setValue(0);
      Animated.timing(thinkingScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }).start();

      // Start rotation animation
      Animated.loop(
        Animated.timing(thinkingRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Start dots animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingDotsAnim, {
            toValue: 3,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingDotsAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start floating animations for the bubbles
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingBubble1, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(thinkingBubble1, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingBubble2, {
            toValue: 1,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(thinkingBubble2, {
            toValue: 0,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingBubble3, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(thinkingBubble3, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animations when not loading
      thinkingDotsAnim.stopAnimation();
      thinkingRotate.stopAnimation();
      thinkingBubble1.stopAnimation();
      thinkingBubble2.stopAnimation();
      thinkingBubble3.stopAnimation();

      // Fade out
      Animated.timing(thinkingScale, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, isProcessingAudio]);

  // Animation interpolations
  const thinkingDotsOpacity1 = thinkingDotsAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 1, 1, 1],
  });

  const thinkingDotsOpacity2 = thinkingDotsAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 0, 1, 1],
  });

  const thinkingDotsOpacity3 = thinkingDotsAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 0, 0, 1],
  });

  const thinkingRotation = thinkingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bubbleOneTransform = thinkingBubble1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const bubbleTwoTransform = thinkingBubble2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const bubbleThreeTransform = thinkingBubble3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const thinkingOpacity = thinkingScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const thinkingScaleTransform = thinkingScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    try {
      setStreamedResponse(""); // Reset streamed response
      const result = await queryAI(query);

      if (result) {
        setResponse(result.answer);
        setRelevantNotes(result.relevantNotes);
        simulateStreamingResponse(result.answer);

        // Wait for streaming to complete before playing TTS
        if (isTTSEnabled) {
          // Small delay to ensure streaming has started
          setTimeout(async () => {
            try {
              console.log("Starting TTS...");
              await speak(result.answer);
            } catch (error) {
              console.error("TTS error:", error);
            }
          }, 500);
        }

        UsageService.incrementUsage(userProfile?.id || "", "aiQueries", 1);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "Failed to process query");
    }
  };

  const handleReset = useCallback(() => {
    if (isLoading) {
      // Cancel ongoing request
      cancelQuery();
      // Cancel streaming if active
      streamController?.abort();
      setStreamController(null);
    }
    // Reset all states
    setQuery("");
    setResponse(null);
    setStreamedResponse("");
    setRelevantNotes([]);
  }, [isLoading, cancelQuery, streamController]);

  const simulateStreamingResponse = (fullResponse: string) => {
    const controller = new AbortController();
    setStreamController(controller);
    let index = 0;
    setStreamedResponse("");

    const interval = setInterval(() => {
      if (controller.signal.aborted) {
        clearInterval(interval);
        return;
      }

      if (index < fullResponse.length) {
        setStreamedResponse((prev) => prev + fullResponse[index]);
        index++;
      } else {
        clearInterval(interval);
        setStreamController(null);
      }
    }, 30);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  };

  const handleCopyResponse = () => {
    if (response) {
      Clipboard.setString(response);
      Alert.alert("Copied", "Response copied to clipboard");
    }
  };

  const handleAudioTranscribed = async (transcription: { content: string }) => {
    try {
      setIsProcessingAudio(true);
      setShowRecorder(false);
      setQuery(transcription.content);

      const result = await queryAI(transcription.content);

      if (result) {
        setResponse(result.answer);
        setRelevantNotes(result.relevantNotes);
        simulateStreamingResponse(result.answer);

        // Wait for streaming to complete before playing TTS
        if (isTTSEnabled) {
          setTimeout(async () => {
            try {
              console.log("Starting TTS for audio query...");
              await speak(result.answer);
            } catch (error) {
              console.error("TTS error:", error);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error processing audio query:", error);
      Alert.alert("Error", "Failed to process audio query");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // Add cleanup for TTS when modal closes
  useEffect(() => {
    if (!visible) {
      stop();
    }
  }, [visible, stop]);

  const renderInputSection = () => (
    <View style={styles.inputContainer}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Ask anything about your notes..."
        multiline
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        textColor={theme.colors.onSurface}
        theme={{
          colors: {
            primary: theme.colors.primary,
          },
        }}
      />
      <View style={styles.buttonContainer}>
        <IconButton
          icon="mic-outline"
          size="small"
          iconSize={24}
          style={{
            borderWidth: 2,
            width: "15%",
            borderColor: theme.colors.primary,
          }}
          onPress={() => setShowRecorder(true)}
        />
        <PrimaryButton
          onPress={handleSubmit}
          loading={isLoading || isProcessingAudio}
          style={styles.askButton}
          disabled={!query.trim() || isLoading || isProcessingAudio}
        >
          Ask AI
        </PrimaryButton>
      </View>
    </View>
  );

  const renderResponseHeader = () => (
    <View style={styles.responseHeader}>
      <Text
        variant="bodySmall"
        style={[styles.responseLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        Response
      </Text>
      <View style={styles.responseControls}>
        <IconButton
          icon={isTTSEnabled ? "volume-high" : "volume-off"}
          onPress={toggleTTS}
          size="small"
          iconSize={20}
          disabled={isLoading || isProcessingAudio}
        />
        {isPlaying && (
          <IconButton icon="stop" onPress={stop} size="small" iconSize={20} />
        )}
      </View>
    </View>
  );

  // Render thinking/loading indicator
  const renderThinkingIndicator = () => {
    if (!isLoading && !isProcessingAudio) return null;

    return (
      <Animated.View
        style={[
          styles.thinkingContainer,
          {
            opacity: thinkingOpacity,
            transform: [{ scale: thinkingScaleTransform }],
          },
        ]}
      >
        <View style={styles.thinkingContent}>
          <View style={styles.thinkingIconsRow}>
            <Animated.View
              style={[
                styles.thinkingBubble,
                {
                  backgroundColor: `${theme.colors.primary}50`,
                  width: 14,
                  height: 14,
                  transform: [{ translateY: bubbleOneTransform }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.thinkingBubble,
                {
                  backgroundColor: `${theme.colors.primary}70`,
                  width: 18,
                  height: 18,
                  transform: [{ translateY: bubbleTwoTransform }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.thinkingMainBubble,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ rotate: thinkingRotation }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={18} color="white" />
            </Animated.View>

            <Animated.View
              style={[
                styles.thinkingBubble,
                {
                  backgroundColor: `${theme.colors.primary}70`,
                  width: 18,
                  height: 18,
                  transform: [{ translateY: bubbleTwoTransform }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.thinkingBubble,
                {
                  backgroundColor: `${theme.colors.primary}50`,
                  width: 14,
                  height: 14,
                  transform: [{ translateY: bubbleThreeTransform }],
                },
              ]}
            />
          </View>

          <View style={styles.thinkingTextContainer}>
            <Text
              variant="body"
              style={[styles.thinkingText, { color: theme.colors.primary }]}
            >
              Thinking
            </Text>
            <View style={styles.dotsContainer}>
              <Animated.Text
                style={[
                  styles.dot,
                  {
                    opacity: thinkingDotsOpacity1,
                    color: theme.colors.primary,
                  },
                ]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.dot,
                  {
                    opacity: thinkingDotsOpacity2,
                    color: theme.colors.primary,
                  },
                ]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.dot,
                  {
                    opacity: thinkingDotsOpacity3,
                    color: theme.colors.primary,
                  },
                ]}
              >
                .
              </Animated.Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <PaywallGuard feature="aiQueries">
      <Modal
        visible={visible}
        onRequestClose={onClose}
        animationType="none"
        transparent
      >
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
                backgroundColor: theme.colors.background,
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
                <Text
                  variant="subtitle1"
                  style={{ color: theme.colors.onSurface }}
                >
                  What can I help you with?
                </Text>
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
              {!response && !isLoading && (
                <View style={styles.suggestedQuestions}>
                  <Text
                    variant="body"
                    style={{ color: theme.colors.onSurface }}
                  >
                    Try asking:
                  </Text>
                  <View style={styles.questionsList}>
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <OutlineButton
                        key={question}
                        onPress={() => {
                          setQuery(question);
                          handleSubmit();
                        }}
                        size="small"
                      >
                        {question}
                      </OutlineButton>
                    ))}
                  </View>
                </View>
              )}

              {(streamedResponse || isLoading) && (
                <ScrollView
                  style={[
                    styles.responseContainer,
                    { backgroundColor: theme.colors.background },
                  ]}
                  contentContainerStyle={styles.responseContent}
                  indicatorStyle={dark ? "black" : "white"}
                >
                  {renderResponseHeader()}

                  {renderThinkingIndicator()}

                  <Text
                    variant="body"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {streamedResponse}
                  </Text>

                  {relevantNotes.length > 0 && streamedResponse && (
                    <View style={styles.sourcesContainer}>
                      <Text variant="subtitle2" style={styles.sourcesTitle}>
                        Related Notes:
                      </Text>
                      {relevantNotes.map((note, index) => (
                        <Text
                          key={index}
                          variant="bodySmall"
                          style={styles.sourceText}
                        >
                          • {note.metadata.title}
                        </Text>
                      ))}
                    </View>
                  )}
                </ScrollView>
              )}

              {/* {error && <Text style={styles.error}>{error}</Text>} */}

              {renderInputSection()}
            </View>
          </Animated.View>
        </View>

        <AudioRecorder
          visible={showRecorder}
          onClose={() => setShowRecorder(false)}
          onTranscribed={handleAudioTranscribed}
          mode="query"
        />
      </Modal>
    </PaywallGuard>
  );
};

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
    maxHeight: "95%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    justifyContent: "center",
  },
  resetButton: {
    padding: 8,
    width: "15%",
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
  responseControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    paddingVertical: 12,
  },
  error: {
    color: "red",
    marginBottom: 16,
  },
  sourcesContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  sourcesTitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  sourceText: {
    opacity: 0.6,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  askButton: {
    width: "85%",
  },
  // Thinking animation styles
  thinkingContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  thinkingContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  thinkingIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    marginBottom: 10,
  },
  thinkingMainBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  thinkingBubble: {
    borderRadius: 12,
    margin: 4,
  },
  thinkingText: {
    fontWeight: "600",
  },
  thinkingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: 2,
  },
  dot: {
    fontSize: 16,
    fontWeight: "700",
  },
});
