import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

import { NotificationRecipient } from "./notification.service";
import { PushTokenService } from "./push-token.service";

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN! });
  }
  /**
   * Send push notifications to multiple recipients
   */
  async sendToRecipients(
    recipients: NotificationRecipient[],
    payload: PushNotificationPayload
  ) {
    try {
      // Get all push tokens for recipients
      const pushTokens = await PushTokenService.getRecipientsTokens(recipients);

      if (pushTokens.length === 0) {
        console.log("No push tokens found for recipients");
        return { success: true, sentCount: 0, errors: [] };
      }

      // Filter valid Expo tokens
      const validTokens = pushTokens.filter((tokenRecord) =>
        Expo.isExpoPushToken(tokenRecord.token)
      );

      if (validTokens.length === 0) {
        console.log("No valid Expo tokens found");
        return { success: true, sentCount: 0, errors: [] };
      }

      // Create messages
      const messages: ExpoPushMessage[] = validTokens.map((tokenRecord) => ({
        to: tokenRecord.token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || "default",
        badge: payload.badge,
      }));

      // Send messages in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];
      const errors: any[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
          errors.push(error);
        }
      }

      // Handle tickets and update token status
      await this.handlePushTickets(
        tickets,
        validTokens.map((t) => t.token)
      );

      return {
        success: true,
        sentCount: validTokens.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Error in sendToRecipients:", error);
      throw error;
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendToUser(
    userId: string,
    userType: "student" | "advisor",
    payload: PushNotificationPayload
  ) {
    return await this.sendToRecipients(
      [{ recipientType: userType, recipientId: userId }],
      payload
    );
  }

  /**
   * Handle push notification tickets and clean up invalid tokens
   */
  private async handlePushTickets(tickets: ExpoPushTicket[], tokens: string[]) {
    const invalidTokens: string[] = [];

    tickets.forEach((ticket, index) => {
      if (ticket.status === "error") {
        console.error(
          `Push notification error for token ${tokens[index]}:`,
          ticket.message
        );

        // Mark token as invalid if it's a device not registered error
        if (ticket.details?.error === "DeviceNotRegistered") {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      await Promise.all(
        invalidTokens.map((token) => PushTokenService.deletePushToken(token))
      );
      console.log(`Cleaned up ${invalidTokens.length} invalid push tokens`);
    }
  }
}

export default new PushNotificationService();
