import { Meeting } from "@prisma/client";
import prisma from "../db";
import { DailyService, DailyRoomConfig } from "./daily.service";
import { createNotification } from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { ApiError } from "../utils/ApiError";
import { io } from "../app";

export interface MeetingData {
  title: string;
  description?: string;
  scheduledAt: Date;
  societyId: string;
  audienceType: "ALL_SOCIETY_MEMBERS" | "SPECIFIC_MEMBERS";
  maxParticipants?: number;
  recordingEnabled?: boolean;
  invitedUserIds?: string[];
}

export interface JoinData {
  dailyRoomUrl: string;
  dailyToken: string;
  meeting: {
    id: string;
    title: string;
    host: string;
    isHost: boolean;
  };
}

interface MeetingNotificationRecipient {
  recipientType: "student" | "advisor";
  recipientId: string;
  webRedirectUrl: string;
}

export class MeetingService {
  private dailyService: DailyService;

  constructor() {
    this.dailyService = new DailyService();
  }

  async createMeeting(
    hostId: string,
    meetingData: MeetingData
  ): Promise<Meeting> {
    const {
      title,
      description,
      scheduledAt,
      societyId,
      audienceType,
      maxParticipants,
      invitedUserIds = [],
    } = meetingData;

    const meetingCode = this.generateMeetingCode();

    const [student, advisor] = await prisma.$transaction([
      prisma.student.findUnique({ where: { id: hostId } }),
      prisma.advisor.findUnique({ where: { id: hostId } }),
    ]);

    // Create meeting in database first
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        meetingCode,
        scheduledAt,
        hostAdvisorId: advisor?.id || null,
        hostStudentId: student?.id || null,
        hostSocietyId: societyId,
        audienceType,
        maxParticipants,
      },
    });

    // Create invitations
    await Promise.all(
      invitedUserIds.map(async (userId: string) => {
        const [student, advisor] = await prisma.$transaction([
          prisma.student.findUnique({ where: { id: userId } }),
          prisma.advisor.findUnique({ where: { id: userId } }),
        ]);

        return prisma.meetingInvitation.create({
          data: {
            meetingId: meeting.id,
            studentId: student?.id || null,
            advisorId: advisor?.id || null,
            status: "PENDING",
          },
        });
      })
    );

    this.sendMeetingNotifications(meeting.id);

    return meeting;
  }

  async getMeetingsForUser(
    userId: string,
    societyId: string
  ): Promise<Meeting[]> {
    const [student, advisor] = await prisma.$transaction([
      prisma.student.findUnique({
        where: { id: userId },
        include: { societies: true },
      }),
      prisma.advisor.findUnique({ where: { id: userId } }),
    ]);

    const user = student || advisor;
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        hostSocietyId: societyId,
        OR: [
          { audienceType: "ALL_SOCIETY_MEMBERS" },
          {
            OR: [
              { invitations: { some: { studentId: user.id } } },
              { invitations: { some: { advisorId: user.id } } },
            ],
          },
          {
            OR: [{ hostStudentId: user.id }, { hostAdvisorId: user.id }],
          },
        ],
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        hostAdvisor: true,
        hostStudent: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return meetings;
  }

  async joinMeeting(userId: string, meetingId: string): Promise<JoinData> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        hostAdvisor: true,
        hostStudent: true,
        participants: true,
      },
    });

    if (!meeting) throw new ApiError(404, "Meeting not found");
    if (meeting.status === "ENDED")
      throw new ApiError(400, "Meeting has ended");
    if (meeting.status === "CANCELLED")
      throw new ApiError(400, "Meeting was cancelled");
    if (meeting.scheduledAt > new Date()) {
      throw new ApiError(400, "Meeting has not started yet.");
    }

    const hasAccess = await this.checkMeetingAccess(userId, meeting);
    if (!hasAccess) {
      throw new ApiError(403, "Access denied to meeting");
    }

    const isHost =
      userId === meeting.hostStudentId || userId === meeting.hostAdvisorId;

    // Create Daily room on first join (must be host)
    let dailyRoomUrl = meeting.dailyRoomUrl;
    if (!dailyRoomUrl) {
      if (!isHost) {
        throw new ApiError(403, "Only the meeting host can start the meeting");
      }
      dailyRoomUrl = await this.createDailyRoomForMeeting(meeting, userId);
    }

    // Generate Daily token for user
    const [student, advisor] = await prisma.$transaction([
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.advisor.findUnique({ where: { id: userId } }),
    ]);

    const user = student || advisor;
    const userName = user
      ? `${user.firstName} ${user.lastName}`
      : "Unknown User";

    const dailyToken = await this.dailyService.generateMeetingToken(
      meeting.dailyRoomName!,
      userId,
      userName,
      isHost
    );

    // Update meeting status to LIVE if not already
    if (meeting.status === "SCHEDULED") {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "LIVE",
          startedAt: new Date(),
        },
      });
    }

    return {
      dailyRoomUrl,
      dailyToken,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        host: meeting.hostStudent?.id || meeting.hostAdvisor?.id || "",
        isHost:
          userId === meeting.hostStudentId || userId === meeting.hostAdvisorId,
      },
    };
  }

  async joinMeetingByCode(
    userId: string,
    meetingCode: string
  ): Promise<JoinData> {
    const meeting = await prisma.meeting.findUnique({
      where: { meetingCode },
    });

    if (!meeting) throw new ApiError(400, "Invalid meeting code");

    return this.joinMeeting(userId, meeting.id);
  }

  private async createDailyRoomForMeeting(
    meeting: any,
    hostId: string
  ): Promise<string> {
    const roomName = `meeting-${meeting.id}-${Date.now()}`;

    // Set room expiration to 80 minutes from now
    const expirationTime = Date.now() + 80 * 60 * 1000; // 80 minutes in ms

    const roomConfig: DailyRoomConfig = {
      name: roomName,
      privacy: "private",
      properties: {
        max_participants: meeting.maxParticipants || 50,
        start_audio_off: true,
        start_video_off: true,
        enable_chat: true,
        enable_knocking: false,
        enable_prejoin_ui: false,
        enable_network_ui: true,
        enable_screenshare: true,
        exp: Math.floor(expirationTime / 1000),
        eject_after_elapsed: 8 * 60 * 60, // 8 hours max meeting duration
        eject_at_room_exp: true,
        lang: "en",
      },
    };

    const room = await this.dailyService.createRoom(roomConfig);

    // Update meeting with Daily room details
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        dailyRoomUrl: room.url,
        dailyRoomName: room.name,
        dailyRoomConfig: roomConfig.properties,
      },
    });

    return room.url;
  }

  async checkMeetingAccess(userId: string, meeting: Meeting): Promise<boolean> {
    if (userId === meeting.hostAdvisorId || userId === meeting.hostStudentId) {
      return true;
    }

    if (meeting.audienceType === "ALL_SOCIETY_MEMBERS") {
      const [membership, advisor] = await prisma.$transaction([
        prisma.studentSociety.findFirst({
          where: {
            studentId: userId,
            societyId: meeting.hostSocietyId,
          },
        }),
        prisma.society.findUnique({
          where: {
            id: meeting.hostSocietyId,
            advisor: { id: userId },
          },
        }),
      ]);
      return !!membership || !!advisor;
    }

    if (meeting.audienceType === "SPECIFIC_MEMBERS") {
      const invitation = await prisma.meetingInvitation.findFirst({
        where: {
          meetingId: meeting.id,
          OR: [{ studentId: userId }, { advisorId: userId }],
        },
      });
      return !!invitation;
    }

    return false;
  }

  generateMeetingCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async sendMeetingNotifications(meetingId: string): Promise<void> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        hostSociety: { select: { name: true, members: true } },
        invitations: { select: { advisorId: true, studentId: true } },
      },
    });

    let recipients: MeetingNotificationRecipient[] = [];
    if (meeting?.audienceType === "ALL_SOCIETY_MEMBERS") {
      recipients =
        meeting?.hostSociety.members.map((member) => ({
          recipientType: "student",
          recipientId: member.studentId,
          webRedirectUrl: `/video-meetings/${meeting?.hostSocietyId}`,
        })) || [];
    } else if (meeting?.invitations) {
      recipients = meeting.invitations.map((invitation) => {
        if (invitation.advisorId) {
          return {
            recipientType: "advisor",
            recipientId: invitation.advisorId,
            webRedirectUrl: `/video-meetings/${meeting?.hostSocietyId}`,
          };
        } else {
          return {
            recipientType: "student",
            recipientId: invitation.studentId!,
            webRedirectUrl: `/video-meetings/${meeting?.hostSocietyId}`,
          };
        }
      });
    }

    const validRecipients = (recipients || []).filter(
      (recipient) => recipient.recipientId !== null
    ) as MeetingNotificationRecipient[];

    const notification = await createNotification({
      title: "New Meeting Scheduled",
      description: `A new meeting has been scheduled by ${meeting?.hostSociety.name}.`,
      recipients: validRecipients,
    });

    if (notification) {
      sendNotificationToUsers(io, validRecipients, notification);
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new ApiError(404, "Meeting not found");
    }

    // Delete Daily room if it exists
    if (meeting.dailyRoomName) {
      try {
        await this.dailyService.deleteRoom(meeting.dailyRoomName);
      } catch (error) {
        console.error("Error deleting Daily room:", error);
        // Continue with database deletion even if room deletion fails
      }
    }

    // Delete meeting from database
    await prisma.meeting.delete({
      where: { id: meetingId },
    });
  }
}
