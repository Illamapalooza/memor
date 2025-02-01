import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";

export default function PrivacyPolicyScreen() {
  const theme = useAppTheme();

  const handleBack = () => {
    router.back();
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text variant="subtitle1" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );

  const BulletPoint = ({ text }: { text: string }) => (
    <View style={styles.bulletPoint}>
      <Text style={styles.bullet}>•</Text>
      <Text variant="body" style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back-outline"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
        <Text variant="subtitle2" style={styles.title}>
          Privacy Policy
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text variant="subtitle1" style={styles.mainTitle}>
          Privacy Policy
        </Text>

        <Text variant="body" style={styles.paragraph}>
          This privacy policy applies to the memor app (hereby referred to as
          "Application") for mobile devices that was created by Julius Baliling
          (hereby referred to as "Service Provider") as a Freemium service. This
          service is intended for use "AS IS".
        </Text>

        <Section title="Information Collection and Use">
          <Text variant="body" style={styles.paragraph}>
            The Application collects information when you download and use it.
            This information may include information such as:
          </Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Your device's Internet Protocol address (e.g. IP address)" />
            <BulletPoint text="The pages of the Application that you visit, the time and date of your visit, the time spent on those pages" />
            <BulletPoint text="The time spent on the Application" />
            <BulletPoint text="The operating system you use on your mobile device" />
          </View>
        </Section>

        <Section title="Location Information">
          <Text variant="body" style={styles.paragraph}>
            The Application collects your device's location, which helps the
            Service Provider determine your approximate geographical location
            and make use of in below ways:
          </Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Geolocation Services: The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services." />
            <BulletPoint text="Analytics and Improvements: Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application." />
            <BulletPoint text="Third-Party Services: Periodically, the Service Provider may transmit anonymized location data to external services." />
          </View>
        </Section>

        {/* Add more sections following the same pattern */}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            This privacy policy is effective as of 2025-03-31
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            Contact: julisubaliling25@gmail.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
  mainTitle: {
    fontSize: 24,
    marginBottom: 16,
    fontFamily: "Nunito-Bold",
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: "Nunito-Bold",
    color: colors.jasper.DEFAULT,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: 8,
    marginLeft: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 16,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
  },
  bulletText: {
    flex: 1,
    lineHeight: 24,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.jasper[100],
  },
  footerText: {
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.7,
  },
});
