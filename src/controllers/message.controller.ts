import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { IUser } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import db from "../db";
import { emitSocketEvent } from "../socket";

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const files = req.files as Express.Multer.File[];

  const message = await messageService.createMessage(
    chatId,
    (req.user as IUser).id,
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

  if (chat) {
    emitSocketEvent(
      req,
      chat.id,
      "new-message",
      message,
      chat.participants,
      (req.user as IUser).id
    );
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
