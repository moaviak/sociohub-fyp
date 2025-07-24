import express, { Router } from "express";
import { handleDailyWebhook } from "../controllers/daily-webhook.controller";
import stripeWebhookController from "../controllers/stripe-webhook.controller";

const router = Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController.handleStripeWebhook.bind(stripeWebhookController)
);

router.post("/daily", express.json(), handleDailyWebhook);

export default router;
