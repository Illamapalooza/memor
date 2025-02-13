import React, { createContext, useContext, useState, useCallback } from "react";
import { PaywallModal } from "@/components/core/PaywallModal";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { SubscriptionService } from "@/services/subscription/subscription.service";
import { DEFAULT_SUBSCRIPTION } from "@/utils/defaults";

type PaywallContextType = {
  showPaywall: (feature?: "aiQueries" | "audioRecordings" | "storage") => void;
  hidePaywall: () => void;
  checkFeatureAccess: (
    feature: "aiQueries" | "audioRecordings" | "storage"
  ) => Promise<boolean>;
};

const PaywallContext = createContext<PaywallContextType | null>(null);

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<
    "aiQueries" | "audioRecordings" | "storage" | undefined
  >();
  const { userProfile } = useAuth();

  const showPaywall = useCallback(
    async (feature?: "aiQueries" | "audioRecordings" | "storage") => {
      if (!userProfile) return;

      const subscription = await SubscriptionService.getCurrentSubscription();

      // Don't show paywall if user has active subscription
      if (SubscriptionService.isSubscriptionActive(subscription)) {
        return;
      }

      setCurrentFeature(feature);
      setIsVisible(true);
    },
    [userProfile]
  );

  const hidePaywall = useCallback(() => {
    setIsVisible(false);
    setCurrentFeature(undefined);
  }, []);

  const checkFeatureAccess = useCallback(
    async (
      feature: "aiQueries" | "audioRecordings" | "storage"
    ): Promise<boolean> => {
      if (!userProfile) return false;

      const subscription = await SubscriptionService.getCurrentSubscription();

      // If user has an active pro subscription, they have access to all features
      if (
        SubscriptionService.isSubscriptionActive(
          subscription || DEFAULT_SUBSCRIPTION
        )
      ) {
        return true;
      }

      // Check usage limits
      const hasAccess = await UsageService.checkUsageLimit(
        userProfile.id,
        feature
      );

      if (!hasAccess) {
        // Show paywall if access is denied
        showPaywall(feature);
        return false;
      }

      return true;
    },
    [userProfile, showPaywall]
  );

  return (
    <PaywallContext.Provider
      value={{ showPaywall, hidePaywall, checkFeatureAccess }}
    >
      {children}
      <PaywallModal
        visible={isVisible}
        onClose={hidePaywall}
        feature={currentFeature}
        permanent={
          currentFeature && userProfile
            ? !UsageService.checkUsageLimit(userProfile.id, currentFeature)
            : false
        }
      />
    </PaywallContext.Provider>
  );
}

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error("usePaywall must be used within a PaywallProvider");
  }
  return context;
};
