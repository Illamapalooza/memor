import Stripe from "stripe";
import { logger } from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export type SubscriptionPlan = "monthly" | "yearly";

export type CreateSubscriptionParams = {
  customerId: string;
  plan: SubscriptionPlan;
  paymentMethodId: string;
};

export type CustomerParams = {
  email: string;
  name?: string;
  userId: string;
};

export class StripeService {
  static readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  private static TRIAL_DAYS = 7;

  static async createOrRetrieveCustomer({
    email,
    name,
    userId,
  }: CustomerParams) {
    try {
      // First, try to find an existing customer by userId in metadata
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const existingCustomer = existingCustomers.data[0];
        if (existingCustomer.metadata.userId === userId) {
          logger.info(`Retrieved existing Stripe customer for ${email}`);
          return existingCustomer;
        }
      }

      // If no existing customer found, create a new one
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId, // Store Firebase user ID in metadata for future reference
        },
      });

      logger.info(`Created new Stripe customer for ${email}`);
      return customer;
    } catch (error) {
      logger.error("Error managing Stripe customer:", error);
      throw error;
    }
  }

  static async attachPaymentMethodToCustomer(
    customerId: string,
    paymentMethodId: string
  ) {
    try {
      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      logger.info(
        `Attached payment method ${paymentMethodId} to customer ${customerId}`
      );
    } catch (error) {
      logger.error("Error attaching payment method:", error);
      throw error;
    }
  }

  static async createSubscription({
    customerId,
    plan,
    paymentMethodId,
  }: CreateSubscriptionParams) {
    try {
      // Verify customer exists
      const customer = await this.stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found");
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price:
              plan === "monthly"
                ? process.env.STRIPE_MONTHLY_PRICE_ID
                : process.env.STRIPE_YEARLY_PRICE_ID,
          },
        ],
        trial_period_days: this.TRIAL_DAYS,
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        default_payment_method: paymentMethodId,
      });

      logger.info(`Created subscription for customer ${customerId}`);
      return subscription;
    } catch (error) {
      logger.error("Error creating subscription:", error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(
        subscriptionId
      );
      logger.info(`Cancelled subscription ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  static async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );
      return subscription;
    } catch (error) {
      logger.error("Error retrieving subscription:", error);
      throw error;
    }
  }

  static async createTrialSubscription({ customerId }: { customerId: string }) {
    try {
      // Verify customer exists
      const customer = await this.stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found");
      }

      // Create subscription with trial
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: process.env.STRIPE_MONTHLY_PRICE_ID, // Default to monthly plan
          },
        ],
        trial_period_days: this.TRIAL_DAYS,
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
      });

      logger.info(`Created trial subscription for customer ${customerId}`);
      return subscription;
    } catch (error) {
      logger.error("Error creating trial subscription:", error);
      throw error;
    }
  }

  static async createCustomer({
    email,
    name,
    metadata,
  }: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      logger.info(`Created Stripe customer for ${email}`);
      return customer;
    } catch (error) {
      logger.error("Error creating customer:", error);
      throw error;
    }
  }

  static async retrieveCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new Error("Customer has been deleted");
      }
      return customer;
    } catch (error) {
      logger.error("Error retrieving customer:", error);
      throw error;
    }
  }

  static async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    mode = "subscription",
    trialPeriodDays = 7,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    mode?: "subscription" | "payment";
    trialPeriodDays?: number;
  }) {
    try {
      // Verify customer exists
      const customer = await this.retrieveCustomer(customerId);

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode,
        subscription_data:
          mode === "subscription"
            ? {
                trial_period_days: trialPeriodDays,
              }
            : undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      logger.info(`Created checkout session for customer ${customerId}`);
      return session;
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      throw error;
    }
  }

  static async createPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info(`Created portal session for customer ${customerId}`);
      return session;
    } catch (error) {
      logger.error("Error creating portal session:", error);
      throw error;
    }
  }
}
