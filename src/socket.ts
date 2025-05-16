import { Server, Socket } from "socket.io";
import jwt, { UserJwtPayload } from "jsonwebtoken";
import prisma from "./db";
import { Notification } from "./services/notification.service";

// Keep track of connected users by their ID
const connectedUsers = new Map<string, Set<string>>();

export const setupSocketIO = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as UserJwtPayload;

      // Attach user info to socket
      socket.data.userId = decoded.id;
      socket.data.userType = decoded.userType; // 'student' or 'advisor'

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle connection
  io.on("connection", (socket: Socket) => {
    const { userId, userType } = socket.data;

    if (userId) {
      // Add user to connected users map
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)?.add(socket.id);

      // Join user-specific room
      socket.join(`${userType}-${userId}`);

      console.log(
        `User connected: ${userType}-${userId}, Socket ID: ${socket.id}`
      );

      // Handle client requesting their unread notification count
      socket.on("get-notification-count", async () => {
        try {
          const whereClause: any = {
            recipientType: userType,
            isRead: false,
            isDeleted: false,
          };

          // Set the ID field based on user type
          if (userType === "student") {
            whereClause.studentId = userId;
          } else if (userType === "advisor") {
            whereClause.advisorId = userId;
          }

          const count = await prisma.notificationRecipient.count({
            where: whereClause,
          });

          socket.emit("notification-count", { count });
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      });

      // Handle client marking notification as read
      socket.on(
        "mark-notification-read",
        async (data: { notificationId: string }) => {
          try {
            // Find the notification recipient first to ensure it exists and belongs to this user
            const recipientWhere: any = {
              id: data.notificationId,
              recipientType: userType,
              isRead: false, // Only update if it hasn't been read yet
            };

            // Set the user ID field based on user type
            if (userType === "student") {
              recipientWhere.studentId = userId;
            } else if (userType === "advisor") {
              recipientWhere.advisorId = userId;
            }

            // First check if the record exists
            const existingRecipient =
              await prisma.notificationRecipient.findFirst({
                where: recipientWhere,
                include: {
                  notification: true,
                },
              });

            if (!existingRecipient) {
              console.log(
                `Notification recipient not found: ${data.notificationId} for ${userType}-${userId}`
              );
              return; // Exit early if no matching record
            }

            // Update the notification status
            const updatedNotification =
              await prisma.notificationRecipient.update({
                where: {
                  id: data.notificationId, // This is actually the recipient ID
                },
                data: {
                  isRead: true,
                  readAt: new Date(),
                },
                include: {
                  notification: true,
                },
              });

            // Update notification count
            const countWhereClause: any = {
              recipientType: userType,
              isRead: false,
              isDeleted: false,
            };

            // Set the ID field based on user type
            if (userType === "student") {
              countWhereClause.studentId = userId;
            } else if (userType === "advisor") {
              countWhereClause.advisorId = userId;
            }

            const count = await prisma.notificationRecipient.count({
              where: countWhereClause,
            });

            socket.emit("notification-count", { count });

            // Emit updated notification
            if (updatedNotification) {
              const formattedNotification: Notification = {
                id: updatedNotification.id,
                title: updatedNotification.notification.title,
                description:
                  updatedNotification.notification.description || undefined,
                image: updatedNotification.notification.image || undefined,
                webRedirectUrl: updatedNotification.webRedirectUrl || undefined,
                mobileRedirectUrl:
                  updatedNotification.mobileRedirectUrl || undefined,
                isRead: updatedNotification.isRead,
                isDeleted: updatedNotification.isDeleted,
                readAt: updatedNotification.readAt
                  ? updatedNotification.readAt.toISOString()
                  : undefined,
                createdAt: updatedNotification.createdAt.toISOString(),
                updatedAt: updatedNotification.updatedAt.toISOString(),
              };
              socket.emit("notification-updated", formattedNotification);
            }
          } catch (error) {
            console.error("Error marking notification as read:", error);
            // Send an error response to the client
            socket.emit("notification-error", {
              message: "Could not mark notification as read",
              notificationId: data.notificationId,
            });
          }
        }
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            connectedUsers.delete(userId);
          }
        }
        console.log(
          `User disconnected: ${userType}-${userId}, Socket ID: ${socket.id}`
        );
      });
    }
  });
};

/**
 * Send a notification to specific users
 */
export const sendNotificationToUsers = (
  io: Server,
  recipients: Array<{
    recipientType: "student" | "advisor";
    recipientId: string;
  }>,
  notification: Notification
) => {
  recipients.forEach((recipient) => {
    const roomId = `${recipient.recipientType}-${recipient.recipientId}`;
    io.to(roomId).emit("new-notification", notification);
  });
};
