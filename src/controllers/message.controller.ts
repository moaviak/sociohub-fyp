import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { IUser } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import db from "../db";
import { emitSocketEvent } from "../socket";
import { NotificationRecipient } from "../services/notification.service";
import pushNotificationService from "../services/push-notification.service";

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const { chatId } = req.params;
  const { content } = req.body;
  const files = req.files as Express.Multer.File[];

  const message = await messageService.createMessage(
    chatId,
    user.id,
    content,
    files
  );

  // Get all participants of the chat to broadcast the message
  const chat = await db.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: { select: { advisorId: true, studentId: true } },
    },
  });

  if (chat && message) {
    emitSocketEvent(
      req,
      chat.id,
      "new-message",
      message,
      chat.participants,
      (req.user as IUser).id
    );

    // Send Push Notifications to participants
    (async () => {
      const recipients: NotificationRecipient[] = chat.participants.map(
        (participant) => {
          if (participant.advisorId) {
            return {
              recipientType: "advisor",
              recipientId: participant.advisorId,
            };
          } else {
            return {
              recipientType: "student",
              recipientId: participant.studentId!,
            };
          }
        }
      );

      const body =
        message.content ||
        (message.attachments &&
          `Sent ${message.attachments.length} ${
            message.attachments[0].type[0] +
            message.attachments[0].type.substring(1).toLowerCase()
          }${message.attachments.length > 1 ? "s" : ""}`);
      if (chat.type === "ONE_ON_ONE") {
        await pushNotificationService.sendToRecipients(recipients, {
          title: `New message from ${user.firstName} ${user.lastName}`,
          body,
        });
      } else {
        await pushNotificationService.sendToRecipients(recipients, {
          title: `New message in ${chat.name}`,
          body: `${user.firstName} ${user.lastName}: ${body}`,
        });
      }
    })();
  }

  return res.status(201).json(new ApiResponse(201, message));
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const messages = await messageService.getMessages(chatId);
  return res.status(200).json(new ApiResponse(200, messages));
});

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const result = await messageService.deleteMessage(
      req,
      messageId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, result));
  }
);
