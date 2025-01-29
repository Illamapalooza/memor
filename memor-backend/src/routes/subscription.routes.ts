import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import express from "express";

const router = Router();

// Regular routes
router.post("/", SubscriptionController.createSubscription);
router.post("/trial", SubscriptionController.createTrialSubscription);
router.get("/:subscriptionId", SubscriptionController.getSubscription);
router.delete("/:subscriptionId", SubscriptionController.cancelSubscription);

// Checkout and portal routes
router.post(
  "/create-checkout-session",
  SubscriptionController.createCheckoutSession
);
router.post(
  "/create-portal-session",
  SubscriptionController.createPortalSession
);

// Webhook handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  SubscriptionController.handleWebhook
);

export const subscriptionRoutes = router;
