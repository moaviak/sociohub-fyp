import {
  PaymentStatus,
  PaymentTransaction,
  SocietyPaymentConfig,
} from "@prisma/client";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import Stripe from "stripe";
import stripeService from "./stripe.service";
import { sendPaymentConfirmationEmail } from "../utils/mail";

export interface PaymentData {
  businessName?: string;
  businessType?: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  bankAccountNumber?: string;
  bankAccountTitle?: string;
  bankName?: string;
  branchCode?: string;
  taxId?: string;
}

class PaymentService {
  calculatePlatformFee(amount: number): number {
    const feePercentage =
      parseFloat(process.env.PLATFORM_FEE_PERCENTAGE!) || 2.5;
    return Math.round(amount * (feePercentage / 100) + 30);
  }

  // UPDATED: Create checkout session for event registration
  async createCheckoutSession(
    eventId: string,
    studentId: string,
    registrationId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{
    transaction: PaymentTransaction;
    checkoutUrl: string;
    sessionId: string;
  }> {
    try {
      // Get event details
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          society: {
            include: {
              paymentConfig: true,
            },
          },
        },
      });

      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      if (!event.paidEvent || !event.ticketPrice) {
        throw new ApiError(400, "Event is not a paid event");
      }

      const paymentConfig = event.society.paymentConfig;
      if (!paymentConfig || !paymentConfig.isOnboarded) {
        throw new ApiError(400, "Society payment setup not complete");
      }

      // Calculate amounts
      const amount = event.ticketPrice;
      const applicationFeeAmount = this.calculatePlatformFee(amount);

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        amount * 100, // Convert to cents
        "pkr",
        paymentConfig.stripeAccountId,
        applicationFeeAmount * 100, // Convert to cents
        {
          eventId,
          studentId,
          registrationId,
          eventTitle: event.title,
        },
        successUrl ||
          `${process.env.APP_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl ||
          `${process.env.APP_BASE_URL}/payment-cancel?event_id=${eventId}&payment_cancelled=true`
      );

      // Save transaction
      const transaction = await prisma.paymentTransaction.create({
        data: {
          eventId,
          studentId,
          registrationId,
          stripeCheckoutSessionId: session.id,
          amount,
          applicationFeeAmount,
          transferAmount: amount - applicationFeeAmount,
          status: "PENDING",
          description: `Ticket for ${event.title}`,
        },
      });

      return {
        transaction,
        checkoutUrl: session.url!,
        sessionId: session.id,
      };
    } catch (error) {
      console.error(`Failed to create checkout session: ${error}`);
      throw new ApiError(500, `Failed to create checkout session`);
    }
  }

  // UPDATED: Process successful payment from session
  async processSuccessfulPayment(sessionId: string) {
    try {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        include: {
          event: true,
          student: true,
          registration: true,
        },
      });

      if (!transaction) {
        throw new ApiError(404, "Transaction not found");
      }

      const session = await stripeService.retrieveCheckoutSession(sessionId);

      if (session.payment_status !== "paid") {
        throw new ApiError(400, "Payment not successful");
      }

      // Update transaction status
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          stripePaymentIntentId: (
            session.payment_intent as Stripe.PaymentIntent
          )?.id,
        },
      });

      await sendPaymentConfirmationEmail(transaction.student.email, {
        amountPaid: transaction.amount.toString(),
        eventTitle: transaction.event.title,
        paymentDate: new Date().toUTCString(),
        studentName:
          transaction.student.firstName + " " + transaction.student.lastName,
        eventDate: transaction.event.startDate?.toDateString(),
        eventVenue: transaction.event.venueName ?? undefined,
      });

      return {
        sessionId,
        status: PaymentStatus.COMPLETED,
        registrationId: transaction.registrationId,
      };
    } catch (error) {
      console.error(`Failed to process successful payment: ${error}`);
      throw new ApiError(500, `Failed to process successful payment`);
    }
  }

  // UPDATED: Get payment status by session ID
  async getPaymentStatus(sessionId: string) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
      include: {
        registration: {
          include: {
            ticket: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError(404, "Payment transaction not found");
    }

    return {
      sessionId,
      status: transaction.status,
      ticketId: transaction.registration?.ticket?.id,
      registrationId: transaction.registrationId,
    };
  }

  // Get payment transactions for event
  async getEventTransactions(eventId: string): Promise<PaymentTransaction[]> {
    try {
      return await prisma.paymentTransaction.findMany({
        where: { eventId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              registrationNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error(`Failed to get event transactions: ${error}`);
      throw new ApiError(500, `Failed to get event transactions`);
    }
  }

  async getSocietyOnboardingStatus(societyId: string) {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      include: {
        paymentConfig: true,
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid Society ID");
    }

    if (!society.paymentConfig) {
      return {
        isOnboarded: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    const account = await stripeService.getAccount(
      society.paymentConfig.stripeAccountId
    );

    return {
      isOnboarded: society.paymentConfig.isOnboarded,
      accountId: society.paymentConfig.stripeAccountId,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  }

  async startOnboarding(
    societyId: string,
    userEmail: string,
    returnUrl?: string
  ) {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      include: { paymentConfig: true },
    });

    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    let stripeAccountId: string;

    if (society.paymentConfig) {
      stripeAccountId = society.paymentConfig.stripeAccountId;
    } else {
      const account = await stripeService.createConnectAccount(userEmail);

      stripeAccountId = account.id;

      await prisma.societyPaymentConfig.create({
        data: {
          stripeAccountId,
          societyId: society.id,
          isOnboarded: false,
        },
      });
    }

    const refreshUrl = `${process.env.APP_BASE_URL}/settings/${society.id}/payments/refresh`;
    const accountLink = await stripeService.createAccountLink(
      stripeAccountId,
      returnUrl ||
        `${process.env.APP_BASE_URL}/settings/${society.id}/payments/complete`,
      refreshUrl
    );

    return accountLink;
  }

  async completeOnboarding(societyId: string) {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      include: { paymentConfig: true },
    });

    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    if (!society.paymentConfig) {
      throw new ApiError(400, "Payment configuration is not completed yet");
    }

    // Verify account with Stripe
    const account = await stripeService.getAccount(
      society.paymentConfig.stripeAccountId
    );

    await prisma.societyPaymentConfig.update({
      where: { societyId },
      data: {
        isOnboarded: true,
        onboardingCompletedAt: new Date(),
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });

    const status = {
      isOnboarded: true,
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };

    return status;
  }
}

export default new PaymentService();
