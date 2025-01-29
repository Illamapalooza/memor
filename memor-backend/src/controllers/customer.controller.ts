import { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { StripeService } from "../services/stripe.service";
import { db } from "../services/firebase.service";

export class CustomerController {
  static async createOrRetrieveCustomer(req: Request, res: Response) {
    try {
      const { email, name, userId } = req.body;

      if (!email || !userId) {
        throw new AppError(400, "Email and userId are required");
      }

      // Check if customer already exists in Firestore
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();

      if (userData?.stripeCustomerId) {
        // Retrieve existing customer
        const customer = await StripeService.retrieveCustomer(
          userData.stripeCustomerId
        );
        logger.info(`Retrieved existing Stripe customer for ${email}`);
        return res.json({ customerId: customer.id });
      }

      // Create new customer
      const customer = await StripeService.createCustomer({
        email,
        name,
        metadata: { userId },
      });

      logger.info(`Created new Stripe customer for ${email}`);
      res.json({ customerId: customer.id });
    } catch (error) {
      logger.error("Error managing customer:", error);
      throw new AppError(500, "Error managing customer");
    }
  }
}
