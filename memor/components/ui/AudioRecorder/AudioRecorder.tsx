import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, Pressable, Animated } from "react-native";
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

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (uri: string) => void;
};

export function AudioRecorder({ visible, onClose, onSave }: Props) {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const theme = useAppTheme();
  const { userProfile } = useAuth();

  // Animation values
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const modalTranslateY = React.useRef(new Animated.Value(300)).current;

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

  const handleSave = async () => {
    if (!userProfile?.id) return;

    if (recordingUri) {
      try {
        // Track usage before saving
        await UsageService.incrementUsage(userProfile?.id, "audioRecordings");

        await onSave(recordingUri);
      } catch (error) {
        console.error("Error saving recording:", error);
      }
    }
    setShowConfirmation(false);
    setRecordingUri(null);
    setDuration(0);
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
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
              <Text variant="h3">Record Audio Note</Text>
              <Pressable onPress={handleClose}>
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </Pressable>
            </View>

            <View style={styles.recordingContainer}>
              <Text variant="h3" style={styles.timer}>
                {formatDuration(duration)}
              </Text>

              {recordingUri ? (
                <>
                  <AudioPlayer uri={recordingUri} />
                  <View style={styles.actionButtons}>
                    <OutlineButton onPress={handleDiscard}>
                      Discard
                    </OutlineButton>
                    <PrimaryButton onPress={handleSave}>Save</PrimaryButton>
                  </View>
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

              <Text variant="bodySmall" style={styles.hint}>
                {isRecording
                  ? isPaused
                    ? "Recording paused"
                    : "Recording in progress"
                  : recordingUri
                  ? "Review your recording"
                  : "Tap to start recording"}
              </Text>
            </View>
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
});
