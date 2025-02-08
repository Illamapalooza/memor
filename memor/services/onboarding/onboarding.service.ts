import { db } from "@/services/db/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { UserOnboarding } from "@/utils/types/db";

export class OnboardingService {
  static async getOnboardingStatus(userId: string) {
    try {
      const onboardingRef = doc(db, "userOnboarding", userId);
      const onboardingDoc = await getDoc(onboardingRef);

      if (!onboardingDoc.exists()) {
        // Create initial onboarding document if it doesn't exist
        const initialOnboarding: UserOnboarding = {
          userId,
          hasCompletedOnboarding: false,
          firstSignInAt: new Date(),
          lastSignInAt: new Date(),
          onboardingSteps: {
            welcomeScreen: false,
            featureTour: false,
            createFirstNote: false,
          },
        };
        await setDoc(onboardingRef, initialOnboarding);
        return initialOnboarding;
      }

      return onboardingDoc.data() as UserOnboarding;
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      throw error;
    }
  }

  static async updateOnboardingStep(
    userId: string,
    step: keyof UserOnboarding["onboardingSteps"],
    completed: boolean
  ) {
    try {
      const onboardingRef = doc(db, "userOnboarding", userId);
      await updateDoc(onboardingRef, {
        [`onboardingSteps.${step}`]: completed,
        lastSignInAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      throw error;
    }
  }

  static async completeOnboarding(userId: string) {
    try {
      const onboardingRef = doc(db, "userOnboarding", userId);
      await updateDoc(onboardingRef, {
        hasCompletedOnboarding: true,
        lastSignInAt: new Date(),
        onboardingSteps: {
          welcomeScreen: true,
          featureTour: true,
          createFirstNote: false,
        },
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  }
}
