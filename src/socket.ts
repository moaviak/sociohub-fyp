import { Server, Socket } from "socket.io";
import jwt, { UserJwtPayload } from "jsonwebtoken";
import prisma from "./db";
import { Notification } from "./services/notification.service";
import { Request } from "express";

// Keep track of connected users by their ID
const connectedUsers = new Map<string, Set<string>>();

const getChatPartners = async (userId: string) => {
  const userChats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          OR: [{ studentId: userId }, { advisorId: userId }],
        },
      },
    },
    select: {
      participants: {
        select: {
          studentId: true,
          advisorId: true,
        },
      },
    },
  });

  const partnerIds = new Set<string>();
  userChats.forEach((chat) => {
    chat.participants.forEach((participant) => {
      const partnerId = participant.studentId || participant.advisorId;
      if (partnerId && partnerId !== userId) {
        partnerIds.add(partnerId);
      }
    });
  });

  return Array.from(partnerIds);
};

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
      const wasOffline =
        !connectedUsers.has(userId) || connectedUsers.get(userId)!.size === 0;
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)!.add(socket.id);

      if (wasOffline) {
        // Notify partners that this user is now online
        getChatPartners(userId).then((partners) => {
          partners.forEach((partnerId) => {
            const socketIds = connectedUsers.get(partnerId);
            socketIds?.forEach((socketId) => {
              io.to(socketId).emit("user-online", { userId });
            });
          });
        });
      }

      // Join user-specific room for personal notifications
      socket.join(`${userType}-${userId}`);

      // User joins rooms for each of their chats
      prisma.chat
        .findMany({
          where: {
            participants: {
              some: {
                OR: [{ studentId: userId }, { advisorId: userId }],
              },
            },
          },
          select: {
            id: true,
          },
        })
        .then((chats) => {
          chats.forEach((chat) => {
            socket.join(chat.id);
          });
        });

      socket.on("get-chat-partners-status", async () => {
        try {
          const partners = await getChatPartners(userId);
          const statuses: { [key: string]: boolean } = {};
          partners.forEach((partnerId) => {
            statuses[partnerId] = connectedUsers.has(partnerId);
          });
          socket.emit("chat-partners-status", statuses);
        } catch (error) {
          console.error("Error getting chat partners status:", error);
        }
      });

      socket.on("typing", ({ chatId }) => {
        socket.to(chatId).emit("typing", { chatId, userId });
      });

      socket.on("stop-typing", ({ chatId }) => {
        socket.to(chatId).emit("stop-typing", { chatId, userId });
      });

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
            // Notify partners that this user is now offline
            getChatPartners(userId).then((partners) => {
              partners.forEach((partnerId) => {
                const socketIds = connectedUsers.get(partnerId);
                socketIds?.forEach((socketId) => {
                  io.to(socketId).emit("user-offline", { userId });
                });
              });
            });
          }
        }
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

export const getReceiverSocketIds = (receiverId: string) => {
  return connectedUsers.get(receiverId);
};

export const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: string,
  payload: any,
  participants: { studentId: string | null; advisorId: string | null }[],
  senderId?: string
) => {
  const io: Server = req.app.get("io");

  // Ensure all participants are in the room for real-time events
  participants.forEach((p) => {
    const participantId = p.studentId || p.advisorId;
    if (participantId) {
      const socketIds = getReceiverSocketIds(participantId);
      socketIds?.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        // If the socket exists and is not already in the room, join it.
        if (socket && !socket.rooms.has(roomId)) {
          socket.join(roomId);
        }
      });
    }
  });

  let roomEmitter: any = io.to(roomId);

  if (senderId) {
    const senderSocketIds = getReceiverSocketIds(senderId);
    if (senderSocketIds && senderSocketIds.size > 0) {
      roomEmitter = roomEmitter.except(Array.from(senderSocketIds));
    }
  }

  roomEmitter.emit(event, payload);
};
