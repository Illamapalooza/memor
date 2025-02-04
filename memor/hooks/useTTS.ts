import { useState, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/utils/config";
import * as FileSystem from "expo-file-system";

export const useTTS = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);

  useEffect(() => {
    loadTTSSetting();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
  };

  const loadTTSSetting = async () => {
    try {
      const enabled = await AsyncStorage.getItem("settings.tts_enabled");
      setIsTTSEnabled(enabled === "true");
    } catch (error) {
      console.error("Error loading TTS setting:", error);
    }
  };

  const speak = useCallback(
    async (text: string) => {
      try {
        if (!isTTSEnabled || !text) return;
        console.log("TTS enabled, preparing to speak...");

        // Stop any existing playback
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }

        // Configure audio session
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Generate temporary file path
        const tempUri = `${
          FileSystem.cacheDirectory
        }temp_audio_${Date.now()}.mp3`;

        // Make the TTS request
        const response = await fetch(`${API_URL}/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate speech");
        }

        // Get the audio buffer as blob
        const audioBlob = await response.blob();

        // Convert blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result.split(",")[1]);
            }
          };
        });
        reader.readAsDataURL(audioBlob);
        const base64Audio = (await base64Promise) as string;

        // Write the audio file
        await FileSystem.writeAsStringAsync(tempUri, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Load and play audio
        console.log("Creating sound object...");
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: tempUri },
          { shouldPlay: true, volume: 1.0 },
          (status) => {
            if (status.isLoaded) {
              console.log("Playback status:", status);
              setIsPlaying(!status.didJustFinish);
            }
          }
        );

        setSound(newSound);
        setIsPlaying(true);

        // Clean up temp file after playback
        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log("Playback finished");
            setIsPlaying(false);
            try {
              await FileSystem.deleteAsync(tempUri);
            } catch (error) {
              console.error("Error cleaning up audio file:", error);
            }
          }
        });
      } catch (error) {
        console.error("Error in speak function:", error);
        setIsPlaying(false);
      }
    },
    [isTTSEnabled, sound]
  );

  const stop = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      } catch (error) {
        console.error("Error stopping playback:", error);
      }
    }
  }, [sound]);

  const toggleTTS = useCallback(async () => {
    const newValue = !isTTSEnabled;
    await AsyncStorage.setItem("settings.tts_enabled", String(newValue));
    setIsTTSEnabled(newValue);
  }, [isTTSEnabled]);

  return {
    speak,
    stop,
    isPlaying,
    isTTSEnabled,
    toggleTTS,
  };
};
