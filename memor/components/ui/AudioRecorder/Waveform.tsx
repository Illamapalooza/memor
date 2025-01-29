import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Audio } from "expo-av";

type Props = {
  isRecording: boolean;
  recording: Audio.Recording | undefined;
};

export function Waveform({ isRecording, recording }: Props) {
  const theme = useAppTheme();
  const bars = new Array(30).fill(0);
  const animatedValues = useRef(bars.map(() => new Animated.Value(1))).current;
  const metering = useRef<number[]>(new Array(30).fill(0)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && recording) {
      interval = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording) {
            const { metering: level = -160 } = status;
            // Normalize the metering value to a scale of 0-1
            const normalizedLevel = Math.max(0, (level + 160) / 160);
            // Scale the level to get more visible movement
            const scaledLevel = 1 + normalizedLevel * 2;

            // Shift the metering array and add the new value
            metering.shift();
            metering.push(scaledLevel);

            // Animate each bar to its new height
            animatedValues.forEach((value, index) => {
              Animated.spring(value, {
                toValue: metering[index],
                damping: 10,
                mass: 0.5,
                stiffness: 100,
                useNativeDriver: true,
              }).start();
            });
          }
        } catch (error) {
          console.error("Failed to get recording status:", error);
        }
      }, 100);
    } else {
      // Reset the bars when not recording
      animatedValues.forEach((value) => {
        Animated.spring(value, {
          toValue: 1,
          damping: 10,
          mass: 0.5,
          stiffness: 100,
          useNativeDriver: true,
        }).start();
      });
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, recording]);

  return (
    <View style={styles.container}>
      {bars.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: theme.colors.primary,
              opacity: isRecording ? 1 : 0.3,
              transform: [
                {
                  scaleY: animatedValues[index],
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    gap: 2,
  },
  bar: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
});
