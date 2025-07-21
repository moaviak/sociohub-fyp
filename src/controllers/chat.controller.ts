import { Request, Response } from "express";
import * as chatService from "../services/chat.service";
import { IUser } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

export const getChats = asyncHandler(async (req: Request, res: Response) => {
  const chats = await chatService.getChats((req.user as IUser).id);
  return res.status(200).json(new ApiResponse(200, chats));
});

export const createGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, participants } = req.body;

    const avatarLocalPath = req.file?.path;

    let avatar;
    if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath, "group_covers");
    }

    const chat = await chatService.createGroupChat(
      name,
      (req.user as IUser).id,
      participants,
      avatar?.url
    );
    return res.status(201).json(new ApiResponse(201, chat));
  }
);

export const renameGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { name } = req.body;
    const chat = await chatService.renameGroupChat(
      chatId,
      name,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, chat));
  }
);

export const addParticipant = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { participantId } = req.body;
    const chat = await chatService.addParticipant(
      chatId,
      participantId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, chat));
  }
);

export const removeParticipant = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId, participantId } = req.params;
    const chat = await chatService.removeParticipant(
      chatId,
      participantId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, chat));
  }
);

export const getOneToOneChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { recipientId } = req.params;
    const chat = await chatService.getOneToOneChat(
      (req.user as IUser).id,
      recipientId
    );
    return res.status(200).json(new ApiResponse(200, chat));
  }
);

export const deleteOneToOneChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const result = await chatService.deleteOneToOneChat(
      req,
      chatId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, result));
  }
);

export const leaveGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const result = await chatService.leaveGroupChat(
      req,
      chatId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, result));
  }
);

export const deleteGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const result = await chatService.deleteGroupChat(
      req,
      chatId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, result));
  }
);

export const markChatAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const result = await chatService.markChatAsRead(
      chatId,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, result));
  }
);

export const getSuggestedUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await chatService.getSuggestedUsers((req.user as IUser).id);
    return res.status(200).json(new ApiResponse(200, users));
  }
);

export const addParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { participantIds } = req.body;
    const chat = await chatService.addParticipants(
      chatId,
      participantIds,
      (req.user as IUser).id
    );
    return res.status(200).json(new ApiResponse(200, chat));
  }
);
