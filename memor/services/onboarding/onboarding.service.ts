import { db } from "@/services/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserOnboarding } from "@/utils/types/db";

export class OnboardingService {
  static async getOnboardingStatus(userId: string) {
    const onboardingRef = doc(db, "userOnboarding", userId);
    const onboardingDoc = await getDoc(onboardingRef);
    return onboardingDoc.data() as UserOnboarding;
  }

  static async updateOnboardingStep(
    userId: string,
    step: keyof UserOnboarding["onboardingSteps"],
    completed: boolean
  ) {
    const onboardingRef = doc(db, "userOnboarding", userId);
    await updateDoc(onboardingRef, {
      [`onboardingSteps.${step}`]: completed,
    });
  }

  static async completeOnboarding(userId: string) {
    const onboardingRef = doc(db, "userOnboarding", userId);
    await updateDoc(onboardingRef, {
      hasCompletedOnboarding: true,
    });
  }
}
