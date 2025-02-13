import { db } from "@/services/db/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import {
  DailyLimits,
  subscriptionLimits,
  TotalLimits,
} from "@/utils/subscription-limits";
import { UserProfile } from "@/utils/types/db";
import { DEFAULT_USAGE_LIMITS } from "@/utils/defaults";

export class UsageService {
  static async incrementUsage(
    userId: string,
    type: "aiQueries" | "audioRecordings" | "storage",
    size?: number
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
        const tier = userData.subscription?.tier || "basic";

        switch (type) {
          case "aiQueries":
            if (tier === "trial" || tier === "pro") {
              // For trial and pro, track daily usage
              const startOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              ).getTime();

              if (updatedLimits.lastAiQuery < startOfDay) {
                updatedLimits.aiQueriesUsed = 1;
              } else {
                updatedLimits.aiQueriesUsed += 1;
              }
            } else {
              // For free and basic, track total usage
              updatedLimits.aiQueriesUsed =
                (updatedLimits.aiQueriesUsed || 0) + 1;
            }
            updatedLimits.lastAiQuery = now.getTime();
            break;

          case "audioRecordings":
            if (tier === "trial" || tier === "pro") {
              // For trial and pro, track daily usage
              const startOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              ).getTime();

              if (updatedLimits.lastAudioRecording < startOfDay) {
                updatedLimits.audioRecordingsUsed = 1;
              } else {
                updatedLimits.audioRecordingsUsed += 1;
              }
            } else {
              // For free and basic, track total usage
              updatedLimits.audioRecordingsUsed =
                (updatedLimits.audioRecordingsUsed || 0) + 1;
            }
            updatedLimits.lastAudioRecording = now.getTime();
            break;

          case "storage":
            if (typeof size !== "number") {
              throw new Error("Size is required for storage tracking");
            }
            updatedLimits.storageUsed = Math.max(
              0,
              (updatedLimits.storageUsed || 0) + size
            );
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

  static async checkUsageLimit(
    userId: string,
    feature: "aiQueries" | "audioRecordings" | "storage",
    size?: number
  ): Promise<boolean> {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userProfile = userDoc.data() as UserProfile;

    if (!userProfile) return false;

    const usageLimits = {
      ...DEFAULT_USAGE_LIMITS,
      ...userProfile.usageLimits,
    };

    const tier = userProfile.subscription?.tier || "basic";
    const limits = subscriptionLimits[tier];

    switch (feature) {
      case "aiQueries": {
        if (tier === "trial" || tier === "pro") {
          const startOfDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
          ).getTime();

          const queriesCount =
            usageLimits.lastAiQuery >= startOfDay
              ? usageLimits.aiQueriesUsed
              : 0;

          const dailyLimits = limits as DailyLimits;

          return queriesCount < (dailyLimits.aiQueriesPerDay || 0);
        }
        // For free and basic tiers
        const totalLimits = limits as TotalLimits;
        return usageLimits.aiQueriesUsed < (totalLimits.aiQueriesTotal || 0);
      }

      case "audioRecordings": {
        if (tier === "trial" || tier === "pro") {
          const startOfDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
          ).getTime();

          const recordingsCount =
            usageLimits.lastAudioRecording >= startOfDay
              ? usageLimits.audioRecordingsUsed
              : 0;

          const dailyLimits = limits as DailyLimits;
          return recordingsCount < (dailyLimits.audioRecordingsPerDay || 0);
        }
        // For free and basic tiers
        const totalLimits = limits as TotalLimits;
        return (
          usageLimits.audioRecordingsUsed <
          (totalLimits.audioRecordingsTotal || 0)
        );
      }

      case "storage": {
        if (typeof size !== "number") return false;
        const newTotal = (usageLimits.storageUsed || 0) + size;
        return newTotal <= limits.storageLimit;
      }

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
      usageLimits.aiQueriesUsed >= (limits as TotalLimits).aiQueriesTotal ||
      usageLimits.aiQueriesUsed >= (limits as DailyLimits).aiQueriesPerDay ||
      usageLimits.audioRecordingsUsed >=
        (limits as TotalLimits).audioRecordingsTotal ||
      usageLimits.audioRecordingsUsed >=
        (limits as DailyLimits).audioRecordingsPerDay ||
      usageLimits.storageUsed >= (limits as TotalLimits).storageLimit
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
