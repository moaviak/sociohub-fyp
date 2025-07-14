import Stripe from "stripe";

class StripeService {
  private stripe: Stripe;
  private apiKey: string | undefined;
  private webhookSecret: string | undefined;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY;

    if (!this.apiKey) {
      throw new Error("Missing Stripe API key in environment variables");
    }

    this.stripe = new Stripe(this.apiKey);
  }

  async createConnectAccount(email: string): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.create({
        type: "express",
        country: "PK",
        email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
        tos_acceptance: {
          service_agreement: "recipient",
        },
      });

      return account;
    } catch (error) {
      throw new Error(`Failed to create Stripe account: ${error}`);
    }
  }

  // Create Account Link for Onboarding
  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });

      return accountLink;
    } catch (error) {
      throw new Error(`Failed to create account link: ${error}`);
    }
  }

  // Get Account Details
  async getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.retrieve(accountId);
    } catch (error) {
      throw new Error(`Failed to retrieve account: ${error}`);
    }
  }

  // NEW: Create Checkout Session for Connect
  async createCheckoutSession(
    amount: number,
    currency: string,
    connectedAccountId: string,
    applicationFeeAmount: number,
    metadata: Record<string, any>,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: metadata.eventTitle || "Event Ticket",
                description: `Ticket for ${metadata.eventTitle}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: connectedAccountId,
          },
          metadata,
        },
        metadata,
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create checkout session: ${error}`);
    }
  }

  // NEW: Retrieve Checkout Session
  async retrieveCheckoutSession(
    sessionId: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });
    } catch (error) {
      throw new Error(`Failed to retrieve checkout session: ${error}`);
    }
  }

  // Construct Webhook Event
  constructWebhookEvent(
    payload: Buffer | string,
    signature: string | Buffer | Array<string>
  ): Stripe.Event {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!this.webhookSecret) {
      throw new Error(
        "Missing Stripe Webhook Secret from environment variables."
      );
    }
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`);
    }
  }

  // Fetch balance for a connected account
  async getAccountBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      // Use Stripe's balance API for the connected account
      return await this.stripe.balance.retrieve({
        stripeAccount: accountId,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve account balance: ${error}`);
    }
  }
}

export default new StripeService();
