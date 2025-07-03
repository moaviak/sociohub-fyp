import { Request, Response } from "express";
import { MeetingService } from "../services/meeting.service";
import { asyncHandler } from "../utils/asyncHandler";

// Add a type for req.user
interface AuthenticatedRequest extends Request {
  user: { id: string };
}

const meetingService = new MeetingService();

export const createMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const hostId = user.id;
    const meetingData = req.body;
    const meeting = await meetingService.createMeeting(hostId, meetingData);
    res.status(201).json(meeting);
  }
);

export const getMeetingsForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const userId = user.id;
    const societyId = req.query.societyId as string;
    const meetings = await meetingService.getMeetingsForUser(userId, societyId);
    res.json(meetings);
  }
);

export const joinMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const userId = user.id;
  const meetingId = req.params.id;
  const joinData = await meetingService.joinMeeting(userId, meetingId);
  res.json(joinData);
});

export const joinMeetingByCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const userId = user.id;
    const { code } = req.body;
    const joinData = await meetingService.joinMeetingByCode(userId, code);
    res.json(joinData);
  }
);

export const deleteMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = req.params.id;
    await meetingService.deleteMeeting(meetingId);
    res.status(204).send();
  }
);
