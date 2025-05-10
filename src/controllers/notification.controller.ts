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

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const {
      page = "1",
      limit = "10",
      includeRead = "false",
      includeDeleted = "false",
    } = req.query;

    const result = await getUserNotifications({
      userId: user.id,
      userType: user.userType.toLowerCase() as "student" | "advisor",
      page: parseInt(page as string),
      limit: parseInt(limit as string),
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
