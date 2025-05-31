import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AnnouncementService } from "../services/announcement.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

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
