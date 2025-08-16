import prisma from "../db";
import { ApiError } from "../utils/ApiError";

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  title: string;
  description?: string;
  image?: string;
  webRedirectUrl?: string;
  mobileRedirectUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationRecipient {
  recipientType: "student" | "advisor";
  recipientId: string;
  webRedirectUrl?: string;
  mobileRedirectUrl?: { pathname: string; params: any };
}

/**
 * Format notification data to match the Notification interface
 */
const formatNotification = (recipient: any) => {
  let mobileRedirectUrl;
  try {
    mobileRedirectUrl = JSON.parse(recipient.mobileRedirectUrl);
  } catch (e) {
    mobileRedirectUrl = undefined;
  }
  return {
    id: recipient.id,
    title: recipient.notification.title,
    description: recipient.notification.description,
    image: recipient.notification.image,
    webRedirectUrl: recipient.webRedirectUrl,
    mobileRedirectUrl,
    isRead: recipient.isRead,
    isDeleted: recipient.isDeleted,
    readAt: recipient.readAt ? recipient.readAt.toISOString() : undefined,
    createdAt: recipient.createdAt.toISOString(),
    updatedAt: recipient.updatedAt.toISOString(),
  };
};

/**
 * Create a notification and send it to multiple recipients
 */
export const createNotification = async ({
  title,
  description,
  image = null,
  webRedirectUrl = null,
  mobileRedirectUrl = null,
  recipients,
}: {
  title: string;
  description: string;
  image?: string | null;
  webRedirectUrl?: string | null;
  mobileRedirectUrl?: {
    pathname: string;
    params: any;
  } | null;
  recipients: Array<{
    recipientType: "student" | "advisor";
    recipientId: string;
    webRedirectUrl?: string | null;
    mobileRedirectUrl?: {
      pathname: string;
      params: any;
    } | null;
  }>;
}) => {
  try {
    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        title,
        description,
        image,
      },
    });

    const createdRecipients = [];

    // Create recipients based on type
    for (const recipient of recipients) {
      try {
        let createdRecipient;

        if (recipient.recipientType === "student") {
          createdRecipient = await prisma.notificationRecipient.create({
            data: {
              notification: { connect: { id: notification.id } },
              recipientType: "student",
              student: { connect: { id: recipient.recipientId } },
              webRedirectUrl: recipient.webRedirectUrl || webRedirectUrl,
              mobileRedirectUrl:
                JSON.stringify(recipient.mobileRedirectUrl) ||
                JSON.stringify(mobileRedirectUrl),
              isRead: false,
              isDeleted: false,
            },
            include: {
              notification: true,
            },
          });
        } else if (recipient.recipientType === "advisor") {
          createdRecipient = await prisma.notificationRecipient.create({
            data: {
              notification: { connect: { id: notification.id } },
              recipientType: "advisor",
              advisor: { connect: { id: recipient.recipientId } },
              webRedirectUrl: recipient.webRedirectUrl || webRedirectUrl,
              mobileRedirectUrl:
                JSON.stringify(recipient.mobileRedirectUrl) ||
                JSON.stringify(mobileRedirectUrl),
              isRead: false,
              isDeleted: false,
            },
            include: {
              notification: true,
            },
          });
        }

        if (createdRecipient) {
          createdRecipients.push(formatNotification(createdRecipient));
        }
      } catch (error) {
        console.warn(
          `Failed to create notification for ${recipient.recipientType} ${recipient.recipientId}:`,
          error
        );
      }
    }

    return createdRecipients.length > 0 ? createdRecipients[0] : null;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get notifications for a user (student or advisor)
 */
export const getUserNotifications = async ({
  userId,
  userType,
  includeRead = false,
  includeDeleted = false,
}: {
  userId: string;
  userType: "student" | "advisor";
  includeRead?: boolean;
  includeDeleted?: boolean;
}) => {
  const whereClause: any = {
    recipientType: userType,
  };

  // Add user ID condition based on type
  if (userType === "student") {
    whereClause.studentId = userId;
  } else if (userType === "advisor") {
    whereClause.advisorId = userId;
  }

  if (!includeRead) {
    whereClause.isRead = false;
  }

  if (!includeDeleted) {
    whereClause.isDeleted = false;
  }

  try {
    const [notificationRecipients, totalCount] = await Promise.all([
      prisma.notificationRecipient.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          notification: true,
        },
      }),
      prisma.notificationRecipient.count({
        where: whereClause,
      }),
    ]);

    // Format notifications according to the interface
    const notifications = notificationRecipients.map(formatNotification);

    return {
      notifications,
      totalCount,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationRecipientId: string
) => {
  return prisma.notificationRecipient.update({
    where: { id: notificationRecipientId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async ({
  userId,
  userType,
}: {
  userId: string;
  userType: "student" | "advisor";
}) => {
  const whereClause: any = {
    recipientType: userType,
    isRead: false,
  };

  // Add user ID condition based on type
  if (userType === "student") {
    whereClause.studentId = userId;
  } else if (userType === "advisor") {
    whereClause.advisorId = userId;
  }

  return prisma.notificationRecipient.updateMany({
    where: whereClause,
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Soft delete a notification for a user and remove it completely if all recipients have deleted it
 */
export const deleteNotification = async (notificationRecipientId: string) => {
  // First get the notification recipient to find the notification ID
  const notificationRecipient = await prisma.notificationRecipient.findUnique({
    where: { id: notificationRecipientId },
    select: { notificationId: true },
  });

  if (!notificationRecipient) {
    throw new ApiError(404, "Notification recipient not found");
  }

  // Mark the notification as deleted for this recipient
  const notification = await prisma.notificationRecipient.update({
    where: { id: notificationRecipientId },
    data: {
      isDeleted: true,
    },
  });

  (async () => {
    // Check if all recipients have deleted this notification
    const remainingRecipients = await prisma.notificationRecipient.count({
      where: {
        notificationId: notificationRecipient.notificationId,
        isDeleted: false,
      },
    });

    // If no recipients remain (all have deleted), remove the notification completely
    if (remainingRecipients === 0) {
      await prisma.notification.delete({
        where: { id: notificationRecipient.notificationId },
      });
    }
  })();

  return notification;
};

/**
 * Find recipients with specific privilege in a society
 */
export const findSocietyMembersWithPrivilege = async (
  societyId: string,
  privilegeKey: string
) => {
  // Get all student members with the specified privilege
  const membersWithPrivilege = await prisma.studentSociety.findMany({
    where: {
      societyId,
      roles: {
        some: {
          role: {
            privileges: {
              some: {
                key: privilegeKey,
              },
            },
          },
        },
      },
    },
    select: {
      studentId: true,
    },
  });

  return membersWithPrivilege.map((member) => ({
    recipientType: "student" as const,
    recipientId: member.studentId,
  }));
};

/**
 * Get the advisor of a society
 */
export const getSocietyAdvisor = async (societyId: string) => {
  const advisor = await prisma.advisor.findFirst({
    where: { societyId },
    select: { id: true },
  });

  return advisor
    ? [{ recipientType: "advisor" as const, recipientId: advisor.id }]
    : [];
};
