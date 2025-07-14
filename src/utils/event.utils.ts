import { EventStatus } from "@prisma/client";
import prisma from "../db";

export class EventUtils {
  static determineEventStatus(
    startDateTime: Date,
    endDateTime: Date
  ): EventStatus {
    const now = new Date();

    if (startDateTime <= now && endDateTime > now) {
      return EventStatus.Ongoing;
    } else if (endDateTime <= now) {
      return EventStatus.Completed;
    } else {
      return EventStatus.Upcoming;
    }
  }

  static async createNotificationRecipients(
    audience: string,
    societyId: string
  ) {
    let recipients: { recipientType: "student"; recipientId: string }[] = [];
    if (audience === "Open") {
      // All students
      const students = await prisma.student.findMany({
        select: { id: true },
      });
      recipients = students.map((student) => ({
        recipientType: "student" as const,
        recipientId: student.id,
      }));
    } else if (audience === "Members") {
      // Only society members
      const members = await prisma.studentSociety.findMany({
        where: { societyId: societyId },
        select: { studentId: true },
      });
      recipients = members.map((member) => ({
        recipientType: "student" as const,
        recipientId: member.studentId,
      }));
    }

    return recipients;
  }
}
