import prisma from "../db";
import db from "../db";
import { ApiError } from "../utils/ApiError";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { AttachmentType } from "@prisma/client";
import { getLocalPath } from "../utils/helpers";
import { emitSocketEvent } from "../socket";
import { Request } from "express";

export const createMessage = async (
  chatId: string,
  senderId: string,
  content: string,
  files?: Express.Multer.File[]
) => {
  const sender = await db.user.findFirst({
    where: { OR: [{ studentId: senderId }, { advisorId: senderId }] },
  });

  if (!sender) {
    // TODO: create a user model for student or advisor
    throw new ApiError(500, "An unexpected error occurred, please try again.");
  }

  const message = await db.message.create({
    data: {
      chatId,
      senderId: sender.id,
      content,
    },
  });

  if (files && files.length > 0) {
    const attachments = await Promise.all(
      files.map(async (file) => {
        const localPath = getLocalPath(file.filename);
        const attachmentType = getAttachmentType(file.mimetype);

        let resource_type: "raw" | "image" | "video" | "auto" = "auto";
        if (attachmentType === "DOCUMENT") {
          resource_type = "raw";
        } else if (attachmentType === "VIDEO") {
          resource_type = "video";
        } else if (attachmentType === "IMAGE") {
          resource_type = "image";
        }

        const uploadResult = await uploadOnCloudinary(
          localPath,
          "chat_attachments",
          resource_type
        );

        if (!uploadResult) {
          await db.message.delete({
            where: {
              id: message.id,
            },
          });
          throw new ApiError(500, "Failed to upload attachments.");
        }
        return {
          messageId: message.id,
          url: uploadResult.secure_url,
          type: attachmentType,
          name: file.originalname,
          size: file.size,
        };
      })
    );

    await db.attachment.createMany({
      data: attachments,
    });
  }

  return db.message.findUnique({
    where: { id: message.id },
    include: {
      attachments: true,
      sender: {
        include: {
          student: true,
          advisor: true,
        },
      },
      readBy: {
        include: {
          advisor: true,
          student: true,
        },
      },
    },
  });
};

export const getMessages = async (chatId: string) => {
  return db.message.findMany({
    where: {
      chatId,
    },
    include: {
      attachments: true,
      sender: {
        include: {
          advisor: true,
          student: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
};

export const deleteMessage = async (req: Request, messageId: string, userId: string) => {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      sender: true,
      attachments: true,
    },
  });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Ensure the user trying to delete is the sender of the message
  const senderUser = await db.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!senderUser || senderUser.id !== message.senderId) {
    throw new ApiError(403, "You are not authorized to delete this message");
  }

  // Extract attachment URLs for background deletion
  const attachmentUrls = message.attachments.map((att) => att.url);

  // Delete the message from the database
  await db.message.delete({
    where: { id: messageId },
  });

  // Queue attachments for background deletion from Cloudinary
  if (attachmentUrls.length > 0) {
    (async () => {
      for (const attachmentUrl of attachmentUrls) {
        await deleteFromCloudinary(attachmentUrl);
      }
    })();
  }

  // Emit socket event to notify other participants about message deletion
  const chat = await db.chat.findUnique({
    where: { id: message.chatId },
    include: {
      participants: { select: { advisorId: true, studentId: true } },
    },
  });

  if (chat) {
    emitSocketEvent(
      req,
      chat.id,
      "delete-message",
      { messageId: message.id, chatId: chat.id },
      chat.participants,
      userId
    );
  }

  return { success: true, message: "Message deleted successfully" };
};

const getAttachmentType = (mimeType: string): AttachmentType => {
  if (mimeType.startsWith("image/")) {
    return AttachmentType.IMAGE;
  } else if (mimeType.startsWith("video/")) {
    return AttachmentType.VIDEO;
  } else if (mimeType.startsWith("audio/")) {
    return AttachmentType.AUDIO;
  } else {
    return AttachmentType.DOCUMENT;
  }
};
