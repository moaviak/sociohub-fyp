import { Request, Response } from "express";
import prisma from "../db";
import stripeService from "../services/stripe.service";
import Stripe from "stripe";
import { EventRegistrationService } from "../services/event-registration.service";

class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers["stripe-signature"];

      const event = stripeService.constructWebhookEvent(req.body, signature!);

      // Log webhook event
      await prisma.paymentWebhookLog.create({
        data: {
          eventType: event.type,
          stripeEventId: event.id,
          data: event.data,
        },
      });

      // Process webhook event
      await this.processWebhookEvent(event);

      // Mark as processed
      await prisma.paymentWebhookLog.update({
        where: { stripeEventId: event.id },
        data: { processed: true },
      });

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);

      // Log error
      if (req.body && req.headers["stripe-signature"]) {
        try {
          const event = stripeService.constructWebhookEvent(
            req.body,
            req.headers["stripe-signature"]
          );
          await prisma.paymentWebhookLog.update({
            where: { stripeEventId: event.id },
            data: {
              error: (error as Error).message,
              processed: false,
            },
          });
        } catch (logError) {
          console.error("Failed to log webhook error:", logError);
        }
      }

      res.status(400);
    }
  }

  async processWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event);
        break;
      case "checkout.session.async_payment_succeeded":
        await this.handleCheckoutSessionAsyncPaymentSucceeded(event);
        break;
      case "checkout.session.async_payment_failed":
        await this.handleCheckoutSessionAsyncPaymentFailed(event);
        break;
      case "checkout.session.expired":
        await this.handleCheckoutSessionExpired(event);
        break;
      case "account.updated":
        await this.handleAccountUpdated(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // NEW: Handle checkout session completed
  private async handleCheckoutSessionCompleted(event: any) {
    const session = event.data.object;
    console.log("Checkout session completed:", session.id);

    try {
      // For synchronous payments, payment is already completed
      if (session.payment_status === "paid") {
        await this.completePaymentTransaction(session.id);
      }
      // For asynchronous payments, wait for async_payment_succeeded
    } catch (error) {
      console.error("Error processing checkout session completion:", error);
    }
  }

  // NEW: Handle async payment succeeded
  private async handleCheckoutSessionAsyncPaymentSucceeded(event: any) {
    const session = event.data.object;
    console.log("Checkout session async payment succeeded:", session.id);

    try {
      await this.completePaymentTransaction(session.id);
    } catch (error) {
      console.error("Error processing async payment success:", error);
    }
  }

  // NEW: Handle async payment failed
  private async handleCheckoutSessionAsyncPaymentFailed(event: any) {
    const session = event.data.object;
    console.log("Checkout session async payment failed:", session.id);

    try {
      await this.failPaymentTransaction(session.id, "Async payment failed");
    } catch (error) {
      console.error("Error processing async payment failure:", error);
    }
  }

  // NEW: Handle checkout session expired
  private async handleCheckoutSessionExpired(event: any) {
    const session = event.data.object;
    console.log("Checkout session expired:", session.id);

    try {
      await this.failPaymentTransaction(session.id, "Checkout session expired");
    } catch (error) {
      console.error("Error processing checkout session expiration:", error);
    }
  }

  // NEW: Helper method to complete payment transaction
  private async completePaymentTransaction(sessionId: string) {
    const paymentTransaction = await prisma.paymentTransaction.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });

    if (!paymentTransaction) {
      console.warn(
        `PaymentTransaction not found for sessionId: ${sessionId}. Skipping update.`
      );
      return;
    }

    await prisma.paymentTransaction.update({
      where: { stripeCheckoutSessionId: sessionId },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await new EventRegistrationService().completeRegistrationAfterPayment(
      paymentTransaction.registrationId
    );

    console.log("Registration completed via checkout session.");
  }

  // NEW: Helper method to fail payment transaction
  private async failPaymentTransaction(sessionId: string, reason: string) {
    const paymentTransaction = await prisma.paymentTransaction.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });

    if (!paymentTransaction) {
      console.warn(
        `PaymentTransaction not found for sessionId: ${sessionId}. Skipping update.`
      );
      return;
    }

    await prisma.paymentTransaction.update({
      where: { stripeCheckoutSessionId: sessionId },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    });

    await new EventRegistrationService().cancelRegistration(
      paymentTransaction.registrationId,
      reason
    );

    console.log("Registration cancelled due to payment failure.");
  }

  private async handleAccountUpdated(event: any) {
    const account = event.data.object;
    console.log("Account updated:", account.id);

    try {
      // Check if payment config exists
      const paymentConfig = await prisma.societyPaymentConfig.findUnique({
        where: { stripeAccountId: account.id },
      });
      if (!paymentConfig) {
        console.warn(
          `SocietyPaymentConfig not found for stripeAccountId: ${account.id}. Skipping update.`
        );
        return;
      }
      // Update payment account status
      await prisma.societyPaymentConfig.update({
        where: { stripeAccountId: account.id },
        data: {
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          updatedAt: new Date(),
        },
      });

      // If account was just approved, send notification
      if (account.charges_enabled) {
        const paymentAccount = await prisma.societyPaymentConfig.findUnique({
          where: { stripeAccountId: account.id },
          include: { society: true },
        });

        if (paymentAccount && paymentAccount.society) {
          console.log("Account Approved");
          // Send account approval notification
          // await sendAccountApprovalEmail(paymentAccount.society.email, {
          //   societyName: paymentAccount.society.name
          // });
        }
      }
    } catch (error) {
      console.error("Error processing account update:", error);
    }
  }
}

export default new WebhookController();
