import { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { stripe, StripeService } from "../services/stripe.service";
import { db } from "../services/firebase.service";
import Stripe from "stripe";

export class SubscriptionController {
  static async createSubscription(req: Request, res: Response) {
    try {
      const { customerId, plan, paymentMethodId } = req.body;

      if (!customerId || !plan || !paymentMethodId) {
        throw new AppError(400, "Missing required fields");
      }

      // Attach payment method to customer
      await StripeService.attachPaymentMethodToCustomer(
        customerId,
        paymentMethodId
      );

      // Create subscription
      const subscription = await StripeService.createSubscription({
        customerId,
        plan,
        paymentMethodId,
      });

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        subscription: {
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_end: subscription.trial_end,
        },
      });
    } catch (error) {
      logger.error("Error in createSubscription:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Error creating subscription");
    }
  }

  static async cancelSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        throw new AppError(400, "Subscription ID is required");
      }

      const subscription = await StripeService.cancelSubscription(
        subscriptionId
      );
      res.json({ subscription });
    } catch (error) {
      logger.error("Error in cancelSubscription:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Error cancelling subscription");
    }
  }

  static async getSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        throw new AppError(400, "Subscription ID is required");
      }

      const subscription = await StripeService.getSubscription(subscriptionId);
      res.json({ subscription });
    } catch (error) {
      logger.error("Error in getSubscription:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Error retrieving subscription");
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );

      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find user by Stripe customer ID
      const usersSnapshot = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        throw new Error("No user found for customer");
      }

      const userId = usersSnapshot.docs[0].id;

      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await db
            .collection("users")
            .doc(userId)
            .set(
              {
                subscription: {
                  tier: subscription.status === "active" ? "pro" : "free",
                  status: subscription.status,
                  currentPeriodEnd: subscription.current_period_end,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  stripeSubscriptionId: subscription.id,
                  trialEnd: subscription.trial_end,
                },
                // Initialize usage limits for pro users
                usageLimits: {
                  aiQueriesPerDay: 0,
                  audioRecordingsPerDay: 0,
                  notesCreated: 0,
                  lastAiQuery: null,
                  lastAudioRecording: null,
                  lastPaywallShow: null,
                },
              },
              { merge: true }
            );
          break;

        case "customer.subscription.deleted":
          await db
            .collection("users")
            .doc(userId)
            .set(
              {
                subscription: {
                  tier: "free",
                  status: "canceled",
                  currentPeriodEnd: null,
                  cancelAtPeriodEnd: false,
                  stripeSubscriptionId: null,
                  trialEnd: null,
                },
                // Reset usage limits to free tier
                usageLimits: {
                  aiQueriesPerDay: 0,
                  audioRecordingsPerDay: 0,
                  notesCreated: 0,
                  lastAiQuery: null,
                  lastAudioRecording: null,
                  lastPaywallShow: null,
                },
              },
              { merge: true }
            );
          break;
      }

      res.json({ received: true });
    } catch (error) {
      logger.error("Error in webhook:", error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  }

  static async createTrialSubscription(req: Request, res: Response) {
    try {
      const { customerId } = req.body;

      // Create subscription with trial period
      const subscription = await StripeService.createTrialSubscription({
        customerId,
      });

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        subscription: {
          current_period_end: subscription.current_period_end,
          trial_end: subscription.trial_end,
        },
      });
    } catch (error) {
      logger.error("Error creating trial subscription:", error);
      throw new AppError(400, "Failed to create trial subscription");
    }
  }

  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const { customerId, priceId, successUrl, cancelUrl } = req.body;

      if (!customerId || !priceId || !successUrl || !cancelUrl) {
        throw new AppError(400, "Missing required fields");
      }

      const session = await StripeService.createCheckoutSession({
        customerId,
        priceId,
        successUrl,
        cancelUrl,
      });

      res.json({ url: session.url });
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      throw new AppError(500, "Error creating checkout session");
    }
  }

  static async createPortalSession(req: Request, res: Response) {
    try {
      const { customerId, returnUrl } = req.body;

      if (!customerId || !returnUrl) {
        throw new AppError(400, "Missing required fields");
      }

      const session = await StripeService.createPortalSession({
        customerId,
        returnUrl,
      });

      res.json({ url: session.url });
    } catch (error) {
      logger.error("Error creating portal session:", error);
      throw new AppError(500, "Error creating portal session");
    }
  }
}
