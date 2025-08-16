import { DevicePlatform } from "@prisma/client";
import prisma from "../db";
import { NotificationRecipient } from "./notification.service";

export class PushTokenService {
  /**
   * Store or update push token for a user
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
    // Find if this exact token for this device and user already exists
    const existingToken = await prisma.pushToken.findFirst({
      where: {
        token,
        deviceId,
        ...(userType === "student"
          ? { studentId: userId }
          : { advisorId: userId }),
      },
    });

    if (existingToken) {
      // Update the existing record
      return await prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          platform,
          isActive: true,
          lastUsedAt: new Date(),
          meta,
          updatedAt: new Date(),
        },
      });
    }

    // Check if same deviceId exists with a different token → deactivate it
    if (deviceId) {
      await prisma.pushToken.updateMany({
        where: {
          deviceId,
          ...(userType === "student"
            ? { studentId: userId }
            : { advisorId: userId }),
          token: { not: token },
        },
        data: { isActive: false },
      });
    }

    // Create a new record for this device/token
    return await prisma.pushToken.create({
      data: {
        token,
        deviceId,
        platform,
        ...(userType === "student"
          ? { studentId: userId }
          : { advisorId: userId }),
        isActive: true,
        lastUsedAt: new Date(),
        meta,
      },
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
   * Clean up invalid/expired tokens
   */
  static async cleanupInvalidTokens() {
    // Remove tokens that haven't been used in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await prisma.pushToken.deleteMany({
      where: {
        OR: [{ lastUsedAt: { lt: thirtyDaysAgo } }, { isActive: false }],
      },
    });
  }
}
