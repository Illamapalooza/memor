import { db } from "@/services/db/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { subscriptionLimits } from "@/utils/subscription-limits";
import { UserProfile } from "@/utils/types/db";
import { DEFAULT_USAGE_LIMITS } from "@/utils/defaults";

export class UsageService {
  static async incrementUsage(
    userId: string,
    type: "aiQueries" | "audioRecordings" | "notes"
  ) {
    const userRef = doc(db, "users", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const userData = userDoc.data() as UserProfile;
        const updatedLimits = {
          ...DEFAULT_USAGE_LIMITS,
          ...userData.usageLimits,
        };

        const now = new Date();

        switch (type) {
          case "aiQueries":
            updatedLimits.aiQueriesUsed =
              (updatedLimits.aiQueriesUsed || 0) + 1;
            updatedLimits.lastAiQuery = now.getTime();
            break;
          case "audioRecordings":
            updatedLimits.audioRecordingsUsed =
              (updatedLimits.audioRecordingsUsed || 0) + 1;
            updatedLimits.lastAudioRecording = now.getTime();
            break;
          case "notes":
            updatedLimits.notesCreated = (updatedLimits.notesCreated || 0) + 1;
            break;
        }

        transaction.update(userRef, {
          usageLimits: updatedLimits,
        });
      });
    } catch (error) {
      console.error("Error incrementing usage:", error);
      throw error;
    }
  }

  static checkUsageLimit(
    userProfile: UserProfile | null,
    feature: "aiQueries" | "audioRecordings" | "notes"
  ): boolean {
    if (!userProfile) return false;

    const usageLimits = {
      ...DEFAULT_USAGE_LIMITS,
      ...userProfile.usageLimits,
    };

    // Default to 'basic' tier if subscription or tier is undefined
    const tier = userProfile.subscription?.tier || "basic";

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    switch (feature) {
      case "aiQueries": {
        const lastQuery = usageLimits.lastAiQuery || 0;
        const queriesCount =
          lastQuery >= startOfDay ? usageLimits.aiQueriesUsed : 0;
        return queriesCount < subscriptionLimits[tier].aiQueriesPerDay;
      }

      case "audioRecordings": {
        const lastRecording = usageLimits.lastAudioRecording || 0;
        const recordingsCount =
          lastRecording >= startOfDay ? usageLimits.audioRecordingsUsed : 0;
        return recordingsCount < subscriptionLimits[tier].audioRecordingsPerDay;
      }

      case "notes":
        return (
          (usageLimits.notesCreated || 0) <
          subscriptionLimits[tier].notesPerMonth
        );

      default:
        return false;
    }
  }

  static hasReachedAnyLimit(profile: UserProfile): boolean {
    const tier = profile.subscription?.tier || "basic";
    const limits = subscriptionLimits[tier];
    const usageLimits = {
      ...DEFAULT_USAGE_LIMITS,
      ...profile.usageLimits,
    };

    return (
      usageLimits.aiQueriesUsed >= limits.aiQueriesPerDay ||
      usageLimits.audioRecordingsUsed >= limits.audioRecordingsPerDay ||
      usageLimits.notesCreated >= limits.notesPerMonth
    );
  }

  static shouldShowPaywall(profile: UserProfile): boolean {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const lastShow = profile.usageLimits.lastPaywallShow || 0;

    // Don't show paywall if it's been less than 5 minutes
    if (now - lastShow < fiveMinutes) {
      return false;
    }

    // Show paywall if any limit is reached
    return this.hasReachedAnyLimit(profile);
  }

  static async updatePaywallShowTime(userId: string) {
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }

      const userData = userDoc.data() as UserProfile;
      const updatedLimits = { ...userData.usageLimits };
      updatedLimits.lastPaywallShow = Date.now();

      transaction.update(userRef, { usageLimits: updatedLimits });
    });
  }

  static async getCurrentLimits(userId: string) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserProfile;

    return {
      limits: subscriptionLimits[userData.subscription.tier],
      usage: userData.usageLimits,
      timeUntilNextPaywall: userData.usageLimits.lastPaywallShow
        ? userData.usageLimits.lastPaywallShow + 5 * 60 * 1000 - Date.now()
        : 0,
    };
  }
}
