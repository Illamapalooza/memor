import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  uri: string;
};

export function AudioPlayer({ uri }: Props) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const theme = useAppTheme();

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        await loadSound();
      } catch (error) {
        console.error("Failed to setup audio", error);
      }
    };

    setupAudio();
    return () => {
      sound?.unloadAsync();
    };
  }, [uri]);

  const loadSound = async () => {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri },
        { progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );
      setSound(audioSound);
    } catch (error) {
      console.error("Failed to load sound", error);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis ?? 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!sound) return;

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (position >= duration) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Failed to toggle play/pause", error);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={togglePlayPause}
        style={[
          styles.playButton,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color={theme.colors.surface}
        />
      </Pressable>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.colors.primary,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text variant="caption">{formatTime(position)}</Text>
          <Text variant="caption">{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
