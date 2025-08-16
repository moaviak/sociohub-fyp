import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { IUser } from "../types";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notification.service";
import { ApiError } from "../utils/ApiError";
import Expo from "expo-server-sdk";
import { PushTokenService } from "../services/push-token.service";

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { includeRead = "false", includeDeleted = "false" } = req.query;

    const result = await getUserNotifications({
      userId: user.id,
      userType: user.userType.toLowerCase() as "student" | "advisor",
      includeRead: (includeRead as string) === "true",
      includeDeleted: (includeDeleted as string) === "true",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Notifications retrieved successfully")
      );
  }
);

export const readNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IUser;

    const notification = await markNotificationAsRead(id);

    return res
      .status(200)
      .json(new ApiResponse(200, notification, "Notification marked as read"));
  }
);

export const readAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    await markAllNotificationsAsRead({
      userId: user.id,
      userType: user.userType.toLowerCase() as "student" | "advisor",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "All notifications marked as read"));
  }
);

export const removeNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IUser;

    const notification = await deleteNotification(id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, notification, "Notification deleted successfully")
      );
  }
);

export const storePushToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, deviceId, platform, meta } = req.body;
    const user = req.user as IUser;

    if (!token) {
      throw new ApiError(400, "Push token is required");
    }

    if (!Expo.isExpoPushToken(token)) {
      throw new ApiError(400, "Invalid Expo push token format");
    }

    const pushToken = await PushTokenService.storePushToken({
      token,
      deviceId,
      platform: platform || "EXPO",
      userId: user.id,
      userType: user.userType,
      meta,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, pushToken, "Push token stored successfully"));
  }
);

export const getUserPushTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const tokens = await PushTokenService.getUserPushTokens(
      user.id,
      user.userType
    );

    return res
      .status(200)
      .json(new ApiResponse(200, tokens, "Push tokens retrieved successfully"));
  }
);

export const deletePushToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { tokenId, deviceId, token } = req.body;

    let result;
    if (tokenId) {
      result = await PushTokenService.deactivatePushToken(tokenId);
    } else if (deviceId) {
      result = await PushTokenService.deletePushTokenByDeviceId(deviceId);
    } else if (token) {
      result = await PushTokenService.deletePushToken(token);
    } else {
      throw new ApiError(400, "Either tokenId, deviceId, or token is required");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Push token deleted successfully"));
  }
);
