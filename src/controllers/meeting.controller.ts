import { Request, Response } from "express";
import { MeetingService } from "../services/meeting.service";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, UserType } from "../types";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import activityService from "../services/activity.service";

const meetingService = new MeetingService();

/**
 * Create a new meeting
 */
export const createMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const hostId = user.id;
    const meetingData = req.body;
    const meeting = await meetingService.createMeeting(hostId, meetingData);

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: meeting.hostSocietyId,
        action: "Create Meeting",
        description: `${user.firstName} ${user.lastName} scheduled a new Meeting.`,
        nature: "CONSTRUCTIVE",
        targetId: meeting.id,
        targetType: "Meeting",
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, meeting, "Meeting created successfully"));
  }
);

/**
 * Get meetings for the current user
 */
export const getMeetingsForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { societyId } = req.query;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required");
    }

    const userId = user.id;
    const meetings = await meetingService.getMeetingsForUser(
      userId,
      societyId as string
    );
    return res
      .status(200)
      .json(new ApiResponse(200, meetings, "Meetings retrieved successfully"));
  }
);

export const joinMeeting = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const userId = user.id;
  const meetingId = req.params.id;
  if (!meetingId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Meeting ID is required"));
  }
  const joinData = await meetingService.joinMeeting(userId, meetingId);
  return res.json(
    new ApiResponse(200, joinData, "Joined meeting successfully")
  );
});

export const joinMeetingByCode = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { meetingCode } = req.body;
    if (!meetingCode) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Meeting code is required"));
    }
    const joinData = await meetingService.joinMeetingByCode(
      user.id,
      meetingCode
    );
    return res.json(
      new ApiResponse(200, joinData, "Joined meeting by code successfully")
    );
  }
);

export const cancelMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const meetingId = req.params.id;
    if (!meetingId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Meeting ID is required"));
    }
    const meeting = await meetingService.cancelMeeting(meetingId);

    if (user.userType === UserType.STUDENT && meeting) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: meeting.hostSocietyId,
        action: "Cancel Meeting",
        description: `${user.firstName} ${user.lastName} cancelled a Meeting.`,
        nature: "ADMINISTRATIVE",
        targetId: meeting.id,
        targetType: "Meeting",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, meeting, "Meeting successfully deleted."));
  }
);

export const updateMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const meetingId = req.params.id;
    if (!meetingId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Meeting ID is required"));
    }

    const { title, description, scheduledAt, audienceType, invitedUserIds } =
      req.body;
    const updatedMeeting = await meetingService.updateMeeting(meetingId, {
      title,
      description,
      scheduledAt,
      audienceType,
      invitedUserIds,
    });

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: updatedMeeting.hostSocietyId,
        action: "Update Meeting",
        description: `${user.firstName} ${user.lastName} updated meeting configurations.`,
        nature: "NEUTRAL",
        targetId: updatedMeeting.id,
        targetType: "Meeting",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedMeeting, "Meeting updated successfully")
      );
  }
);

export const endMeeting = asyncHandler(async (req: Request, res: Response) => {
  const meetingId = req.params.id;
  if (!meetingId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Meeting ID is required"));
  }
  const meeting = await meetingService.endMeeting(meetingId);
  return res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting successfully deleted."));
});

export const deleteMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const meetingId = req.params.id;
    if (!meetingId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Meeting ID is required"));
    }
    const meeting = await meetingService.deleteMeeting(meetingId);

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: meeting.hostSocietyId,
        action: "Delete Meeting",
        description: `${user.firstName} ${user.lastName} deleted a Meeting.`,
        nature: "DESTRUCTIVE",
        targetId: meeting.id,
        targetType: "Meeting",
      });
    }

    return res
      .status(204)
      .json(new ApiResponse(204, null, "Meeting successfully deleted."));
  }
);

export const getMeetingById = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = req.params.id;
    if (!meetingId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Meeting ID is required"));
    }
    const meeting = await meetingService.getMeetingById(meetingId);
    return res
      .status(200)
      .json(new ApiResponse(200, meeting, "Meeting retrieved successfully"));
  }
);
