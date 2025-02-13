import { auth } from "@/services/db/firebase";
import { db } from "@/services/db/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { Platform, Linking } from "react-native";
import { DEFAULT_SUBSCRIPTION } from "@/utils/defaults";
import Constants from "expo-constants";
import { router, useRouter } from "expo-router";

export type SubscriptionTier = "free" | "pro";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

export type UserSubscription = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEnd?: number;
};

type CreateSubscriptionResponse = {
  subscriptionId: string;
  status: SubscriptionStatus;
  clientSecret?: string;
};

type CreateCustomerParams = {
  email: string;
  name?: string;
  userId: string;
};

export class SubscriptionService {
  private async ensureCustomer(user: any) {
    try {
      // Get user document to check for existing Stripe customer ID
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.stripeCustomerId) {
        return userData.stripeCustomerId;
      }

      // Create new customer if none exists

      const url =
        Platform.OS === "ios"
          ? "http://localhost:3000/api/customers"
          : "http://10.0.2.2:3000/api/customers";
      const { data } = await axios.post(url, {
        email: user.email,
        name: user.displayName,
        userId: user.uid,
      });

      // Store Stripe customer ID in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          stripeCustomerId: data.customerId,
        },
        { merge: true }
      );

      return data.customerId;
    } catch (error) {
      console.error("Error ensuring customer:", error);
      throw error;
    }
  }

  async createSubscription(
    plan: "monthly" | "yearly",
    paymentMethodId: string
  ): Promise<CreateSubscriptionResponse> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      // Ensure customer exists and get customer ID
      const customerId = await this.ensureCustomer(user);

      // Create subscription
      const { data } = await axios.post(
        `http://localhost:3000/api/subscriptions`,
        {
          customerId,
          plan,
          paymentMethodId,
        }
      );

      // Update Firestore with subscription details
      await setDoc(
        doc(db, "users", user.uid),
        {
          subscription: {
            tier: "pro",
            status: data.status,
            currentPeriodEnd: data.subscription.current_period_end,
            cancelAtPeriodEnd: data.subscription.cancel_at_period_end,
            stripeCustomerId: customerId,
            stripeSubscriptionId: data.subscriptionId,
            trialEnd: data.subscription.trial_end,
          },
        },
        { merge: true }
      );

      return {
        subscriptionId: data.subscriptionId,
        status: data.status,
        clientSecret: data.clientSecret,
      };
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create subscription"
      );
    }
  }

  async cancelSubscription() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const subscriptionId = userData?.subscription?.stripeSubscriptionId;

      if (!subscriptionId) {
        throw new Error("No active subscription found");
      }

      const url =
        Platform.OS === "ios"
          ? "http://localhost:3000/api/subscriptions"
          : "http://10.0.2.2:3000/api/subscriptions";

      // Cancel subscription through backend
      const { data } = await axios.delete(`${url}/${subscriptionId}`);

      // Update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          subscription: {
            ...userData?.subscription,
            status: "canceled",
            cancelAtPeriodEnd: true,
          },
        },
        { merge: true }
      );

      return data;
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel subscription"
      );
    }
  }

  async getSubscriptionStatus(): Promise<UserSubscription | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      return userData?.subscription || null;
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return null;
    }
  }

  async createCustomer(params: CreateCustomerParams) {
    const url =
      Platform.OS === "ios"
        ? "http://localhost:3000/api/customers"
        : "http://10.0.2.2:3000/api/customers";

    const response = await axios.post(url, params);
    return response.data.customer;
  }

  async createTrialSubscription(customerId: string) {
    const url =
      Platform.OS === "ios"
        ? "http://localhost:3000/api/subscriptions/trial"
        : "http://10.0.2.2:3000/api/subscriptions/trial";

    try {
      // Create trial subscription without payment method
      const { data } = await axios.post(url, {
        customerId,
      });

      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Update Firestore with trial subscription details
      await setDoc(
        doc(db, "users", user.uid),
        {
          subscription: {
            tier: "trial",
            status: "trialing",
            currentPeriodEnd: data.subscription.current_period_end,
            trialEnd: data.subscription.trial_end,
            stripeCustomerId: customerId,
            stripeSubscriptionId: data.subscriptionId,
          },
        },
        { merge: true }
      );

      return data;
    } catch (error: any) {
      console.error("Error creating trial subscription:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create trial subscription"
      );
    }
  }

  static async startCheckout(plan: "monthly" | "yearly") {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const subscriptionInstance = new SubscriptionService();
      const customerId = await subscriptionInstance.ensureCustomer(user);

      const priceId =
        plan === "monthly"
          ? process.env.EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID
          : process.env.EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      const baseUrl = Platform.select({
        ios: "http://localhost:3000",
        android: "http://10.0.2.2:3000",
      });

      // Create fully qualified URLs with https://
      const appDomain = "memor.app"; // Your app's domain
      const successUrl = encodeURIComponent(
        `https://${appDomain}/subscription-success`
      );
      const cancelUrl = encodeURIComponent(
        `https://${appDomain}/subscription-cancel`
      );

      const { data } = await axios.post(
        `${baseUrl}/api/subscriptions/create-checkout-session`,
        {
          customerId,
          priceId,
          successUrl,
          cancelUrl,
        }
      );

      if (Platform.OS === "web") {
        window.location.href = data.url;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          `${Constants.expoConfig?.scheme}://`
        );

        // Handle the redirect back to app
        if (result.type === "success") {
          const url = result.url;
          // Parse the URL to check if it contains success parameters
          const params = new URL(url).searchParams;
          const sessionId = params.get("session_id");

          if (sessionId) {
            router.replace({
              pathname: "/subscription-success",
              params: { session_id: sessionId },
            });
          } else {
            router.replace("/(app)");
          }
        }
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      throw error;
    }
  }

  static async openBillingPortal() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const url =
        Platform.OS === "ios"
          ? "http://localhost:3000/api/subscriptions/create-portal-session"
          : "http://10.0.2.2:3000/api/subscriptions/create-portal-session";

      const { data } = await axios.post(url, {
        customerId: user.uid,
        returnUrl: `${process.env.EXPO_PUBLIC_APP_URL}/settings`,
      });

      if (Platform.OS === "web") {
        window.location.href = data.url;
      } else {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      throw error;
    }
  }

  static async getCurrentSubscription() {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();

    return {
      ...DEFAULT_SUBSCRIPTION,
      ...userData?.subscription,
    };
  }

  static isSubscriptionActive(subscription: UserSubscription | null) {
    if (!subscription) return false;

    const validStatuses = ["active", "trialing"];
    return (
      subscription.tier === "pro" &&
      validStatuses.includes(subscription.status || DEFAULT_SUBSCRIPTION.status)
    );
  }
}

export const subscriptionService = new SubscriptionService();
