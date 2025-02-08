import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/services/auth/AuthProvider";
import { OnboardingService } from "@/services/onboarding/onboarding.service";

type OnboardingContextType = {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  isLoading: boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOnboardingStatus();
    }
  }, [user]);

  const loadOnboardingStatus = async () => {
    try {
      if (!user) return;
      const status = await OnboardingService.getOnboardingStatus(user.uid);
      setHasSeenOnboardingState(status?.hasCompletedOnboarding ?? false);
    } catch (error) {
      console.error("Error loading onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setHasSeenOnboarding = async (value: boolean) => {
    try {
      if (!user) return;
      await OnboardingService.completeOnboarding(user.uid);
      setHasSeenOnboardingState(value);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ hasSeenOnboarding, setHasSeenOnboarding, isLoading }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
