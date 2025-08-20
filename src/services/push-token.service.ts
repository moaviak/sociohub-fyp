import { DevicePlatform } from "@prisma/client";
import prisma from "../db";
import { NotificationRecipient } from "./notification.service";

export class PushTokenService {
  /**
   * Store or update push token for a user
   * Handles the case where user uninstalls/reinstalls the app with same token but different deviceId
   */
  static async storePushToken({
    token,
    deviceId,
    platform = "EXPO",
    userId,
    userType,
    meta,
  }: {
    token: string;
    deviceId?: string;
    platform?: DevicePlatform;
    userId: string;
    userType: "student" | "advisor";
    meta?: any;
  }) {
    const userField = userType === "student" ? "studentId" : "advisorId";
    const userCondition = { [userField]: userId };

    return await prisma.$transaction(async (tx) => {
      // Step 1: Find if this exact token+deviceId+user combination exists
      const exactMatch = await tx.pushToken.findFirst({
        where: {
          token,
          deviceId,
          ...userCondition,
        },
      });

      if (exactMatch) {
        // Exact match found - just update metadata and mark as active
        return await tx.pushToken.update({
          where: { id: exactMatch.id },
          data: {
            platform,
            isActive: true,
            lastUsedAt: new Date(),
            meta,
            updatedAt: new Date(),
          },
        });
      }

      // Step 2: Handle uninstall/reinstall scenario
      // Check if this token exists for this user with any deviceId
      const existingTokenForUser = await tx.pushToken.findFirst({
        where: {
          token,
          ...userCondition,
        },
      });

      if (existingTokenForUser) {
        // Same token exists for this user but with different deviceId
        // This indicates app uninstall/reinstall scenario
        console.log(
          `Token ${token} found with different deviceId. Old: ${existingTokenForUser.deviceId}, New: ${deviceId}`
        );

        // Delete the old record and create a new one
        await tx.pushToken.delete({
          where: { id: existingTokenForUser.id },
        });

        // Continue to create new record below
      }

      // Step 3: Handle token conflicts across users (optional but recommended)
      // If this token exists for a different user, it might be a token reassignment
      const tokenForOtherUser = await tx.pushToken.findFirst({
        where: {
          token,
          NOT: userCondition,
        },
      });

      if (tokenForOtherUser) {
        // Token is now being used by a different user - deactivate old one
        console.log(`Token ${token} being transferred from different user`);
        await tx.pushToken.update({
          where: { id: tokenForOtherUser.id },
          data: { isActive: false },
        });
      }

      // Step 4: Clean up old tokens for this device (if deviceId provided)
      if (deviceId) {
        // Deactivate any other tokens for this user+device combination
        await tx.pushToken.updateMany({
          where: {
            deviceId,
            ...userCondition,
            token: { not: token },
          },
          data: { isActive: false },
        });
      }

      // Step 5: Create the new token record
      return await tx.pushToken.create({
        data: {
          token,
          deviceId,
          platform,
          ...userCondition,
          isActive: true,
          lastUsedAt: new Date(),
          meta,
        },
      });
    });
  }

  /**
   * Get all active push tokens for a user
   */
  static async getUserPushTokens(
    userId: string,
    userType: "student" | "advisor"
  ) {
    return await prisma.pushToken.findMany({
      where: {
        ...(userType === "student"
          ? { studentId: userId }
          : { advisorId: userId }),
        isActive: true,
      },
      orderBy: { lastUsedAt: "desc" },
    });
  }

  /**
   * Delete push token by deviceId
   */
  static async deletePushTokenByDeviceId(deviceId: string) {
    return await prisma.pushToken.deleteMany({
      where: { deviceId },
    });
  }

  /**
   * Delete push token by token value
   */
  static async deletePushToken(token: string) {
    return await prisma.pushToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Mark push token as inactive
   */
  static async deactivatePushToken(tokenId: string) {
    return await prisma.pushToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });
  }

  /**
   * Get push tokens for multiple recipients
   */
  static async getRecipientsTokens(recipients: NotificationRecipient[]) {
    const studentIds = recipients
      .filter((r) => r.recipientType === "student")
      .map((r) => r.recipientId);

    const advisorIds = recipients
      .filter((r) => r.recipientType === "advisor")
      .map((r) => r.recipientId);

    const tokens = await prisma.pushToken.findMany({
      where: {
        isActive: true,
        OR: [
          { studentId: { in: studentIds } },
          { advisorId: { in: advisorIds } },
        ],
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
        advisor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return tokens;
  }

  /**
   * Utility function to clean up inactive tokens (run periodically)
   */
  static async cleanupInactiveTokens(inactiveDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    const result = await prisma.pushToken.deleteMany({
      where: {
        OR: [
          { isActive: false },
          {
            lastUsedAt: {
              lt: cutoffDate,
            },
          },
        ],
      },
    });

    console.log(`Cleaned up ${result.count} inactive push tokens`);
    return result;
  }
}
