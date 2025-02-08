import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Animated,
} from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";

type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
  library: "ionicons" | "material-community";
};

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Your Second Brain",
    description:
      "Capture your thoughts, ideas, inspirations and information in one secure place.",
    icon: "brain",
    library: "material-community",
  },
  {
    id: "2",
    title: "AI-Powered Insights",
    description:
      "Let AI help you organize, analyze, and discover connections in your notes.",
    icon: "sparkles",
    library: "ionicons",
  },
  {
    id: "3",
    title: "Ask Anything",
    description:
      "Ask questions about your notes to gain deeper understanding and discover hidden connections",
    icon: "chat-question",
    library: "material-community",
  },
  {
    id: "4",
    title: "Upgrade to Pro",
    description:
      "Get unlimited access to all features and unlock your potential.",
    icon: "star",
    library: "ionicons",
  },
];

const ProScreen = () => {
  const theme = useAppTheme();

  const BenefitItem = ({
    icon,
    title,
    description,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
  }) => (
    <View style={styles.benefitItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Ionicons name={icon} size={24} color={theme.colors.surface} />
      </View>
      <View style={styles.benefitText}>
        <Text variant="subtitle1" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        <Text
          variant="body"
          style={[styles.benefitDescription, { color: theme.colors.onSurface }]}
        >
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.proScreen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.titleContainer}>
        <Text
          variant="h3"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Unlock Your Full Potential
        </Text>
        <Text
          variant="body"
          style={[styles.subtitle, { color: theme.colors.primary }]}
        >
          Get unlimited access to all premium features
        </Text>
      </View>

      <View style={styles.benefitsList}>
        <BenefitItem
          icon="sparkles-outline"
          title="Unlimited AI Queries"
          description="Ask unlimited questions about your notes and get intelligent insights"
        />
        <BenefitItem
          icon="mic-outline"
          title="Voice to Text"
          description="Convert unlimited voice recordings into organized notes"
        />
        <BenefitItem
          icon="infinite-outline"
          title="Unlimited Notes"
          description="Create and store as many notes as you need"
        />
        <BenefitItem
          icon="cloud-upload-outline"
          title="Cloud Sync"
          description="Access your notes across all your devices"
        />
      </View>

      <View style={styles.pricingContainer}>
        <View
          style={[
            styles.pricingCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text variant="h3" style={{ color: theme.colors.primary }}>
            $9.99
          </Text>
          <Text variant="body" style={{ color: theme.colors.onSurface }}>
            per month
          </Text>
        </View>
        <View
          style={[
            styles.pricingCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text variant="h3" style={{ color: theme.colors.primary }}>
            $99.99
          </Text>
          <Text variant="body" style={{ color: theme.colors.onSurface }}>
            per year
          </Text>
          <Text variant="caption" style={{ color: theme.colors.primary }}>
            Save 17%
          </Text>
        </View>
      </View>
    </View>
  );
};

export function OnboardingScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { setHasSeenOnboarding } = useOnboarding();
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const handleFinish = async () => {
    try {
      await setHasSeenOnboarding(true);
      router.replace("/(app)");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const handleUpgrade = async () => {
    setShowSubscriptionModal(true);
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    if (index === slides.length - 1) {
      return (
        <View style={[styles.slide, { width }]}>
          <ProScreen />
        </View>
      );
    }

    return (
      <View style={[styles.slide, { width }]}>
        {item.library === "ionicons" ? (
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={100}
            color={theme.colors.primary}
          />
        ) : (
          <MaterialCommunityIcons
            name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={100}
            color={theme.colors.primary}
          />
        )}
        <Text
          variant="h2"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          {item.title}
        </Text>
        <Text
          variant="body"
          style={[styles.description, { color: theme.colors.onSurface }]}
        >
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <FlatList
          data={slides}
          renderItem={renderSlide}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={32}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
                extrapolate: "clamp",
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.buttonContainer}>
            {currentIndex < slides.length - 1 ? (
              <>
                <OutlineButton onPress={handleFinish}>Skip</OutlineButton>
                <PrimaryButton onPress={() => scrollTo(currentIndex + 1)}>
                  Next
                </PrimaryButton>
              </>
            ) : (
              <>
                <OutlineButton onPress={handleFinish}>
                  Start with Free
                </OutlineButton>
                <PrimaryButton onPress={handleUpgrade}>
                  Upgrade to Pro
                </PrimaryButton>
              </>
            )}
          </View>
        </View>

        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={handleCloseSubscriptionModal}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  title: {
    textAlign: "center",
    fontFamily: "Nunito-Bold",
  },
  titleContainer: {
    width: "100%",
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  footer: {
    padding: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: colors.jasper.DEFAULT,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  proScreen: {
    flex: 1,
    width: "100%",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    flex: 1,
    gap: 4,
  },
  benefitDescription: {
    opacity: 0.7,
  },
  pricingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 16,
  },
  pricingCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
  },
});
