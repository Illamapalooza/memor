import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Alert,
  Platform,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Waveform } from "./Waveform";
import { AudioPlayer } from "./AudioPlayer";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { PaywallGuard } from "@/components/core/PaywallGuard";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "@/utils/config";
import * as FileSystem from "expo-file-system";

type Props = {
  visible: boolean;
  onClose: () => void;
  onTranscribed?: (result: { title?: string; content: string }) => void;
  mode?: "note" | "query";
};

export function AudioRecorder({
  visible,
  onClose,
  onTranscribed,
  mode = "note",
}: Props) {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const theme = useAppTheme();
  const { userProfile } = useAuth();

  // Animation values
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const modalTranslateY = React.useRef(new Animated.Value(300)).current;

  // Add animation values for the transcription loading indicator
  const transcribeScale = useRef(new Animated.Value(0)).current;
  const transcribeRotate = useRef(new Animated.Value(0)).current;
  const transcribeBubble1 = useRef(new Animated.Value(0)).current;
  const transcribeBubble2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Setup animations for the transcription loading indicator
  useEffect(() => {
    if (isTranscribing) {
      // Start scale animation
      transcribeScale.setValue(0);
      Animated.timing(transcribeScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }).start();

      // Start rotation animation for the main icon
      Animated.loop(
        Animated.timing(transcribeRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Start floating animations for the bubbles
      Animated.loop(
        Animated.sequence([
          Animated.timing(transcribeBubble1, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(transcribeBubble1, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(transcribeBubble2, {
            toValue: 1,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(transcribeBubble2, {
            toValue: 0,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop and reset animations when not transcribing
      transcribeRotate.stopAnimation();
      transcribeBubble1.stopAnimation();
      transcribeBubble2.stopAnimation();

      Animated.timing(transcribeScale, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isTranscribing]);

  // Animation interpolations
  const transcribeRotation = transcribeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bubbleOneTransform = transcribeBubble1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const bubbleTwoTransform = transcribeBubble2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const transcribeOpacity = transcribeScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const transcribeScaleTransform = transcribeScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const handleClose = () => {
    if (recordingUri) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowConfirmation(false);
    setRecordingUri(null);
    setDuration(0);
    onClose();
  };

  const handleTranscribe = async (uri: string) => {
    try {
      setIsTranscribing(true);

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Recording file not found");
      }

      // Upload using FileSystem
      const response = await FileSystem.uploadAsync(
        `${API_URL}/transcription`,
        uri,
        {
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "audio",
          mimeType: "audio/m4a",
          parameters: {
            mode,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Transcription API response status:", response.status);

      let result;
      try {
        result = JSON.parse(response.body);
        console.log("Parsed transcription result:", result);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        console.log("Raw response body:", response.body);
        throw new Error("Failed to parse transcription response");
      }

      if (response.status !== 200) {
        throw new Error(result.message || "Failed to transcribe audio");
      }

      if (onTranscribed) {
        await onTranscribed(result);
        onClose();
      } else {
        // Default note creation behavior
        UsageService.incrementUsage(
          userProfile?.id || "",
          "audioRecordings",
          1
        );

        const title = result.title || "";
        const content = result.content || "";

        console.log("Navigating to create with params:", { title, content });

        // First close the modal
        onClose();

        // Then navigate with a small delay
        setTimeout(() => {
          router.push({
            pathname: "/create",
            params: {
              title,
              content,
            },
          });
        }, 300);
      }
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to transcribe audio"
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  // Update modal title based on mode
  const getModalTitle = () => {
    return mode === "query" ? "Voice Query" : "Record Audio Note";
  };

  async function startRecording() {
    try {
      if (!permissionResponse?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please grant microphone permission to record audio"
          );
          return;
        }
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100 // Update metering every 100ms
      );

      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function pauseRecording() {
    try {
      if (!recording) return;
      await recording.pauseAsync();
      setIsPaused(true);
    } catch (err) {
      console.error("Failed to pause recording", err);
    }
  }

  async function resumeRecording() {
    try {
      if (!recording) return;
      await recording.startAsync();
      setIsPaused(false);
    } catch (err) {
      console.error("Failed to resume recording", err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      setIsRecording(false);
      setIsPaused(false);
      await recording.stopAndUnloadAsync();

      // Update audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = recording.getURI();
      if (uri) {
        setRecordingUri(uri);
      }

      setRecording(undefined);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderRecordingControls = () => (
    <View style={styles.recordingControls}>
      {isRecording && (
        <Pressable
          onPress={isPaused ? resumeRecording : pauseRecording}
          style={[
            styles.controlButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={24}
            color={theme.colors.surface}
          />
        </Pressable>
      )}
      <Pressable
        onPress={isRecording ? stopRecording : startRecording}
        style={[
          styles.recordButton,
          {
            backgroundColor: isRecording
              ? theme.colors.error
              : theme.colors.primary,
          },
        ]}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={32}
          color={theme.colors.surface}
        />
      </Pressable>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {recordingUri ? (
        <View style={styles.actionButtons}>
          <OutlineButton onPress={handleDiscard}>Discard</OutlineButton>
          <PrimaryButton
            onPress={() => handleTranscribe(recordingUri)}
            loading={isTranscribing}
          >
            Generate
          </PrimaryButton>
        </View>
      ) : (
        <Text variant="bodySmall" style={styles.hint}>
          Tap the microphone to start recording
        </Text>
      )}
    </View>
  );

  // Render transcription loading indicator
  const renderTranscribingIndicator = () => {
    if (!isTranscribing) return null;

    return (
      <Animated.View
        style={[
          styles.transcribingOverlay,
          {
            opacity: transcribeOpacity,
            backgroundColor: `${theme.colors.surface}F5`,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.transcribingContainer,
            {
              transform: [{ scale: transcribeScaleTransform }],
            },
          ]}
        >
          <View style={styles.transcribingContent}>
            <View style={styles.transcribingIconsRow}>
              <Animated.View
                style={[
                  styles.transcribingBubble,
                  {
                    backgroundColor: `${theme.colors.primary}80`,
                    transform: [{ translateY: bubbleOneTransform }],
                  },
                ]}
              >
                <Ionicons
                  name="mic-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.transcribingMainBubble,
                  {
                    backgroundColor: theme.colors.primary,
                    transform: [{ rotate: transcribeRotation }],
                  },
                ]}
              >
                <Ionicons name="sync" size={28} color="white" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.transcribingBubble,
                  {
                    backgroundColor: `${theme.colors.primary}80`,
                    transform: [{ translateY: bubbleTwoTransform }],
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </Animated.View>
            </View>

            <Text
              variant="h3"
              style={[
                styles.transcribingTitle,
                { color: theme.colors.primary },
              ]}
            >
              Transcribing Audio
            </Text>

            <Text
              variant="body"
              style={[
                styles.transcribingSubtitle,
                { color: theme.colors.onSurface },
              ]}
            >
              {mode === "query"
                ? "Converting your question to text..."
                : "Creating your note from audio..."}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <PaywallGuard feature="audioRecordings">
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
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
            <Pressable style={styles.dismissArea} onPress={handleClose} />
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
              <Text variant="h3" style={{ color: theme.colors.onSurface }}>
                {getModalTitle()}
              </Text>
              <Pressable onPress={handleClose}>
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={theme.colors.primary}
                />
              </Pressable>
            </View>

            <View style={styles.recordingContainer}>
              <Text
                variant="h3"
                style={[styles.timer, { color: theme.colors.onSurface }]}
              >
                {formatDuration(duration)}
              </Text>

              {recordingUri ? (
                <>
                  <AudioPlayer uri={recordingUri} />
                  {renderFooter()}
                </>
              ) : (
                <>
                  <Waveform
                    isRecording={isRecording && !isPaused}
                    recording={recording}
                  />
                  {renderRecordingControls()}
                </>
              )}
            </View>

            {/* Transcription Loading Overlay */}
            {renderTranscribingIndicator()}
          </Animated.View>

          <Modal visible={showConfirmation} transparent animationType="fade">
            <View style={styles.confirmationOverlay}>
              <View
                style={[
                  styles.confirmationContent,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text variant="h3">Discard Recording?</Text>
                <Text variant="body">
                  Are you sure you want to discard this recording?
                </Text>
                <View style={styles.confirmationButtons}>
                  <OutlineButton onPress={() => setShowConfirmation(false)}>
                    Keep
                  </OutlineButton>
                  <PrimaryButton
                    onPress={handleDiscard}
                    style={{ backgroundColor: theme.colors.error }}
                  >
                    Discard
                  </PrimaryButton>
                </View>
              </View>
            </View>
          </Modal>
        </View>
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
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordingContainer: {
    alignItems: "center",
    gap: 24,
    paddingVertical: 48,
  },
  timer: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: "Nunito-Bold",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmationContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 16,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  recordingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  // Transcribing animation styles
  transcribingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  transcribingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    maxWidth: "90%",
  },
  transcribingContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  transcribingIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 16,
  },
  transcribingMainBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  transcribingBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transcribingTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  transcribingSubtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
});
