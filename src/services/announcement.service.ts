import prisma from "../db";
import { AnnouncementAudience } from "@prisma/client";
import {
  createNotification,
  getSocietyAdvisor,
  findSocietyMembersWithPrivilege,
} from "./notification.service";
import { sendEmail } from "../utils/mail";

export interface CreateAnnouncementInput {
  societyId: string;
  title: string;
  content: string;
  publishDateTime?: Date;
  audience: AnnouncementAudience;
  sendEmail?: boolean;
}

export class AnnouncementService {
  static async createAnnouncement(input: CreateAnnouncementInput) {
    const announcement = await prisma.announcement.create({
      data: {
        societyId: input.societyId,
        title: input.title,
        content: input.content,
        publishDateTime: input.publishDateTime,
        audience: input.audience,
        sendEmail: input.sendEmail ?? false,
      },
    });

    // If publishDateTime is not provided, send notifications and emails now
    if (!input.publishDateTime) {
      let recipients: { recipientType: "student"; recipientId: string }[] = [];
      let emails: string[] = [];

      if (input.audience === "All") {
        // All students in the app (not just society members), no advisors
        const students = await prisma.student.findMany({
          select: { id: true, email: true },
        });
        recipients = students.map((s) => ({
          recipientType: "student",
          recipientId: s.id,
        }));
        emails = students.map((s) => s.email);
      } else if (input.audience === "Members") {
        // Only members of the society
        const members = await prisma.studentSociety.findMany({
          where: { societyId: input.societyId },
          select: { studentId: true, student: { select: { email: true } } },
        });
        recipients = members.map((m) => ({
          recipientType: "student",
          recipientId: m.studentId,
        }));
        emails = members.map((m) => m.student.email);
      }

      // Send notification
      if (recipients.length > 0) {
        await createNotification({
          title: input.title,
          description: input.content,
          recipients,
        });
      }

      // Send email if requested
      if (input.sendEmail && emails.length > 0) {
        await sendEmail({
          email: emails,
          subject: input.title,
          template: "announcement.ejs", // You need to create this template
          data: {
            title: input.title,
            content: input.content,
          },
        });
      }
    }

    return announcement;
  }
}
