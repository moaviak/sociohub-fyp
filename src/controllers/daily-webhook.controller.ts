import { Request, Response } from "express";
import crypto from "crypto";
import { MeetingService } from "../services/meeting.service";
import prisma from "../db";
import { asyncHandler } from "../utils/asyncHandler";

// Daily.co webhook event types
interface DailyWebhookEvent {
  version: string;
  type: string;
  id: string;
  payload:
    | MeetingStartedPayload
    | MeetingEndedPayload
    | ParticipantJoinedPayload
    | ParticipantLeftPayload;
  event_ts: number;
}

interface MeetingStartedPayload {
  start_ts: number;
  meeting_id: string;
  room: string;
}

interface MeetingEndedPayload {
  start_ts: number;
  end_ts: number;
  meeting_id: string;
  room: string;
}

interface ParticipantJoinedPayload {
  joined_at: number;
  session_id: string;
  room: string;
  user_id: string;
  user_name: string;
  owner: boolean;
  networkQualityState?: "unknown" | "good" | "warning" | "bad";
  will_eject_at: number;
  permissions: {
    hasPresence: boolean;
    canSend: boolean;
    canReceive: {
      base: boolean;
      byUserId: boolean;
      byParticipantId: boolean;
    };
    canAdmin: boolean;
  };
}

interface ParticipantLeftPayload {
  joined_at: number;
  duration: number;
  session_id: string;
  room: string;
  user_id: string;
  user_name: string;
  owner: boolean;
  networkQualityState?: "unknown" | "good" | "warning" | "bad";
  will_eject_at: number;
  permissions: {
    hasPresence: boolean;
    canSend: boolean;
    canReceive: {
      base: boolean;
      byUserId: boolean;
      byParticipantId: boolean;
    };
    canAdmin: boolean;
  };
}

export const handleDailyWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { test } = req.body;

    if (test) {
      return res.status(200).json({ received: true });
    }

    const event: DailyWebhookEvent = req.body;
    console.log(`Received Daily webhook: ${event.type}`);

    try {
      switch (event.type) {
        case "participant.joined":
          await handleParticipantJoined(event);
          break;
        case "participant.left":
          await handleParticipantLeft(event);
          break;
        case "meeting.started":
          await handleMeetingStarted(event);
          break;
        case "meeting.ended":
          await handleMeetingEnded(event);
          break;
        default:
          console.log(`Unhandled Daily webhook type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing Daily webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

async function handleParticipantJoined(
  event: DailyWebhookEvent
): Promise<void> {
  const payload = event.payload as ParticipantJoinedPayload;
  const { room, user_id, session_id, joined_at } = payload;
  if (!room || !user_id || !session_id || !joined_at) return;

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { dailyRoomName: room },
    });

    if (!meeting) {
      console.warn(`Meeting not found for Daily room: ${room}`);
      return;
    }

    // Find if user is student or advisor
    const [student, advisor] = await prisma.$transaction([
      prisma.student.findUnique({ where: { id: user_id } }),
      prisma.advisor.findUnique({ where: { id: user_id } }),
    ]);

    if (student) {
      await Promise.all([
        prisma.meetingParticipant.upsert({
          where: {
            meetingId_studentId: { meetingId: meeting.id, studentId: user_id },
          },
          update: {
            joinedAt: new Date(joined_at),
            dailySessionId: session_id,
            leftAt: null, // Reset left time in case of rejoin
          },
          create: {
            meetingId: meeting.id,
            studentId: user_id,
            joinedAt: new Date(joined_at),
            dailySessionId: session_id,
            role: user_id === meeting.hostStudentId ? "HOST" : "PARTICIPANT",
          },
        }),
        prisma.meetingInvitation.update({
          where: {
            meetingId_studentId: { meetingId: meeting.id, studentId: user_id },
          },
          data: {
            status: "ACCEPTED",
          },
        }),
      ]);
    } else if (advisor) {
      await Promise.all([
        prisma.meetingParticipant.upsert({
          where: {
            meetingId_advisorId: { meetingId: meeting.id, advisorId: user_id },
          },
          update: {
            joinedAt: new Date(joined_at),
            dailySessionId: session_id,
            leftAt: null, // Reset left time in case of rejoin
          },
          create: {
            meetingId: meeting.id,
            advisorId: user_id,
            joinedAt: new Date(joined_at),
            dailySessionId: session_id,
            role: user_id === meeting.hostAdvisorId ? "HOST" : "PARTICIPANT",
          },
        }),
        prisma.meetingInvitation.update({
          where: {
            meetingId_advisorId: { meetingId: meeting.id, advisorId: user_id },
          },
          data: {
            status: "ACCEPTED",
          },
        }),
      ]);
    }

    console.log(`Participant ${user_id} joined meeting ${meeting.id}`);
  } catch (error) {
    console.error("Error handling participant joined:", error);
  }
}

async function handleParticipantLeft(event: DailyWebhookEvent): Promise<void> {
  const payload = event.payload as ParticipantLeftPayload;
  const { room, user_id, session_id, left_at } = {
    ...payload,
    left_at:
      payload.joined_at && payload.duration
        ? payload.joined_at + payload.duration * 1000
        : undefined,
  };
  if (!room || !user_id || !session_id) return;

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { dailyRoomName: room },
    });

    if (!meeting) {
      console.warn(`Meeting not found for Daily room: ${room}`);
      return;
    }

    // Find if user is student or advisor
    const [student, advisor] = await prisma.$transaction([
      prisma.student.findUnique({ where: { id: user_id } }),
      prisma.advisor.findUnique({ where: { id: user_id } }),
    ]);

    const leftAtDate = left_at ? new Date(left_at) : new Date();

    if (student) {
      await prisma.meetingParticipant.updateMany({
        where: {
          meetingId: meeting.id,
          studentId: user_id,
          dailySessionId: session_id,
        },
        data: {
          leftAt: leftAtDate,
        },
      });
    } else if (advisor) {
      await prisma.meetingParticipant.updateMany({
        where: {
          meetingId: meeting.id,
          advisorId: user_id,
          dailySessionId: session_id,
        },
        data: {
          leftAt: leftAtDate,
        },
      });
    }

    console.log(`Participant ${user_id} left meeting ${meeting.id}`);
  } catch (error) {
    console.error("Error handling participant left:", error);
  }
}

async function handleMeetingStarted(event: DailyWebhookEvent): Promise<void> {
  const payload = event.payload as MeetingStartedPayload;
  const { room, start_ts } = payload;
  if (!room || !start_ts) return;

  try {
    await prisma.meeting.updateMany({
      where: { dailyRoomName: room },
      data: {
        status: "LIVE",
        startedAt: new Date(start_ts),
      },
    });
    console.log(`Meeting started for room: ${room}`);
  } catch (error) {
    console.error("Error handling meeting started:", error);
  }
}

async function handleMeetingEnded(event: DailyWebhookEvent): Promise<void> {
  const payload = event.payload as MeetingEndedPayload;
  const { room, end_ts } = payload;
  if (!room || !end_ts) return;

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { dailyRoomName: room },
    });

    if (!meeting) {
      throw new Error("Meeting not found.");
    }
    if (meeting?.expiry && meeting.expiry > new Date()) {
      console.log("Meeting expiry time didn't reach yet.");
      return;
    }
    await Promise.all([
      prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "ENDED",
          endedAt: new Date(end_ts),
        },
      }),
      prisma.meetingInvitation.updateMany({
        where: { meetingId: meeting.id },
        data: {
          status: "DECLINED",
        },
      }),
    ]);
    console.log(`Meeting ended for room: ${room}`);
  } catch (error) {
    console.error("Error handling meeting ended:", error);
  }
}
