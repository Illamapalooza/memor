import React, { useState, useEffect, useCallback } from "react";
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
  const theme = useTheme();
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

  const modalTranslateY = React.useRef(new Animated.Value(1000)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

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

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    setStreamedResponse(""); // Reset streamed response
    const result = await queryAI(query);

    if (result) {
      setResponse(result.answer);
      setRelevantNotes(result.relevantNotes);
      simulateStreamingResponse(result.answer);
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

  const handleAudioSave = async (uri: string) => {
    setShowRecorder(false);
    setQuery("Transcribed audio query...");
    setResponse("streaming");
    simulateStreamingResponse(
      "I've processed your audio query and analyzed your notes. Here are the key findings..."
    );
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

      // Automatically trigger the RAG query with transcribed content
      const result = await queryAI(transcription.content);

      if (result) {
        setResponse(result.answer);
        setRelevantNotes(result.relevantNotes);
        simulateStreamingResponse(result.answer);
      }
    } catch (error) {
      console.error("Error processing audio query:", error);
      Alert.alert("Error", "Failed to process audio query");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const renderInputSection = () => (
    <View style={styles.inputContainer}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Ask anything about your notes..."
        multiline
        style={[styles.input, { backgroundColor: theme.colors.background }]}
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
              {!response && !isLoading && (
                <View style={styles.suggestedQuestions}>
                  <Text variant="body">Try asking:</Text>
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
                  style={styles.responseContainer}
                  contentContainerStyle={styles.responseContent}
                >
                  <View style={styles.responseHeader}>
                    <Text variant="bodySmall" style={styles.responseLabel}>
                      Response
                    </Text>
                    {streamedResponse && (
                      <Pressable
                        onPress={handleCopyResponse}
                        style={styles.copyButton}
                      >
                        <Ionicons name="copy-outline" size={16} />
                        <Text variant="bodySmall">Copy</Text>
                      </Pressable>
                    )}
                  </View>

                  <Text variant="body">
                    {streamedResponse}
                    {isLoading && <Text style={{ opacity: 0.5 }}>|</Text>}
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
});
