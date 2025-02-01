import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";

export default function TermsScreen() {
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
          Terms & Conditions
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text variant="subtitle1" style={styles.mainTitle}>
          Terms & Conditions
        </Text>

        <Text variant="body" style={styles.paragraph}>
          These terms and conditions apply to the memor app (hereby referred to
          as "Application") for mobile devices that was created by Julius
          Baliling (hereby referred to as "Service Provider") as a Freemium
          service.
        </Text>

        <Text variant="body" style={styles.paragraph}>
          Upon downloading or utilizing the Application, you are automatically
          agreeing to the following terms. It is strongly advised that you
          thoroughly read and understand these terms prior to using the
          Application.
        </Text>

        <Section title="Usage Rights and Restrictions">
          <Text variant="body" style={styles.paragraph}>
            Unauthorized copying, modification of the Application, any part of
            the Application, or our trademarks is strictly prohibited. Any
            attempts to:
          </Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Extract the source code of the Application" />
            <BulletPoint text="Translate the Application into other languages" />
            <BulletPoint text="Create derivative versions" />
          </View>
          <Text variant="body" style={styles.paragraph}>
            are not permitted. All trademarks, copyrights, database rights, and
            other intellectual property rights related to the Application remain
            the property of the Service Provider.
          </Text>
        </Section>

        <Section title="Third-Party Services">
          <Text variant="body" style={styles.paragraph}>
            The Application utilizes third-party services that have their own
            Terms and Conditions. Links to third-party terms:
          </Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Google Play Services" />
            <BulletPoint text="Google Analytics for Firebase" />
            <BulletPoint text="Expo" />
          </View>
        </Section>

        <Section title="Service Provider Rights">
          <Text variant="body" style={styles.paragraph}>
            The Service Provider reserves the right to:
          </Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Modify the Application at any time" />
            <BulletPoint text="Charge for their services with clear communication" />
            <BulletPoint text="Update the application and its requirements" />
            <BulletPoint text="Terminate service at any time without notice" />
          </View>
        </Section>

        <Section title="Changes to Terms">
          <Text variant="body" style={styles.paragraph}>
            The Service Provider may periodically update these Terms and
            Conditions. You are advised to review this page regularly for any
            changes. Changes are effective immediately upon posting.
          </Text>
        </Section>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            These terms and conditions are effective as of 2025-03-31
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
    marginBottom: 12,
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
