import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AnnouncementService } from "../services/announcement.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IUser } from "../types";

export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId, title, content, publishDateTime, audience, sendEmail } =
      req.body;

    // Defensive: audience should match enum
    try {
      const announcement = await AnnouncementService.createAnnouncement({
        societyId,
        title,
        content,
        publishDateTime: publishDateTime
          ? new Date(publishDateTime)
          : undefined,
        audience,
        sendEmail,
      });
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            announcement,
            "Announcement created successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to create announcement");
    }
  }
);

export const getSocietyAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const userId = (req.user as IUser)?.id;
    if (!societyId || !userId) {
      throw new ApiError(400, "Society ID and user context are required");
    }
    try {
      const announcements = await AnnouncementService.getSocietyAnnouncements(
        societyId,
        userId
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            announcements,
            "Announcements fetched successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to fetch announcements");
    }
  }
);

export const getAnnouncementById = asyncHandler(
  async (req: Request, res: Response) => {
    const { announcementId } = req.params;
    if (!announcementId) {
      throw new ApiError(400, "Announcement ID is required");
    }
    try {
      const announcement = await AnnouncementService.getAnnouncementById(
        announcementId
      );
      if (!announcement) {
        throw new ApiError(404, "Announcement not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            announcement,
            "Announcement fetched successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to fetch announcement");
    }
  }
);

export const updateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { announcementId } = req.params;
    // Only allow specific fields to be updated
    const { title, content, publishDateTime, audience, sendEmail } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (publishDateTime !== undefined)
      updateData.publishDateTime = publishDateTime;
    if (audience !== undefined) updateData.audience = audience;
    if (sendEmail !== undefined) updateData.sendEmail = sendEmail;
    if (!announcementId) {
      throw new ApiError(400, "Announcement ID is required");
    }
    try {
      const updatedAnnouncement = await AnnouncementService.updateAnnouncement(
        announcementId,
        updateData
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedAnnouncement,
            "Announcement updated successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to update announcement");
    }
  }
);

export const deleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { announcementId } = req.params;
    if (!announcementId) {
      throw new ApiError(400, "Announcement ID is required");
    }
    try {
      const deleted = await AnnouncementService.deleteAnnouncement(
        announcementId
      );
      if (!deleted) {
        throw new ApiError(404, "Announcement not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, deleted, "Announcement deleted successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Failed to delete announcement");
    }
  }
);

export const getRecentAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    try {
      const announcements = await AnnouncementService.getRecentAnnouncements({
        limit,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            announcements,
            "Recent announcements fetched successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to fetch recent announcements");
    }
  }
);
