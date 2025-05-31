import prisma from "../db";
import { AnnouncementAudience } from "@prisma/client";
import {
  createNotification,
  getSocietyAdvisor,
  findSocietyMembersWithPrivilege,
} from "./notification.service";
import { sendEmail } from "../utils/mail";
import { haveAnnouncementsPrivilege } from "../utils/helpers";

export interface CreateAnnouncementInput {
  societyId: string;
  title: string;
  content: string;
  publishDateTime?: Date;
  audience: AnnouncementAudience;
  sendEmail?: boolean;
  eventId?: string;
}

export class AnnouncementService {
  static async createAnnouncement(input: CreateAnnouncementInput) {
    const [society, announcement] = await prisma.$transaction([
      prisma.society.findUnique({ where: { id: input.societyId } }),
      prisma.announcement.create({
        data: {
          societyId: input.societyId,
          title: input.title,
          content: input.content,
          status: input.publishDateTime ? "Schedule" : "Publish",
          publishDateTime: input.publishDateTime,
          audience: input.audience,
          sendEmail: input.sendEmail ?? false,
          eventId: input.eventId,
        },
      }),
    ]);

    // If publishDateTime is not provided, send notifications and emails now
    if (!input.publishDateTime) {
      await AnnouncementService.sendAnnouncementNotificationsAndEmails(
        announcement,
        society
      );
    }

    return announcement;
  }

  static async sendAnnouncementNotificationsAndEmails(
    announcement: any,
    society: any
  ) {
    let recipients: { recipientType: "student"; recipientId: string }[] = [];
    let emails: string[] = [];
    if (announcement.audience === "All") {
      const students = await prisma.student.findMany({
        select: { id: true, email: true },
      });
      recipients = students.map((s) => ({
        recipientType: "student",
        recipientId: s.id,
      }));
      emails = students.map((s) => s.email);
    } else if (announcement.audience === "Members") {
      const members = await prisma.studentSociety.findMany({
        where: { societyId: announcement.societyId },
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
        title: announcement.title,
        description: announcement.content,
        recipients,
        image: society?.logo,
      });
    }
    // Send email if requested
    if (announcement.sendEmail && emails.length > 0) {
      await sendEmail({
        email: emails,
        subject: announcement.title,
        template: "announcement.ejs",
        data: {
          title: announcement.title,
          content: announcement.content,
        },
      });
    }
  }

  static async getSocietyAnnouncements(societyId: string, userId: string) {
    // Check if user has announcement privilege
    const hasPrivilege = await haveAnnouncementsPrivilege(userId, societyId);

    // Build where clause
    const where: any = { societyId };
    if (!hasPrivilege) {
      // Exclude scheduled announcements for non-privileged users
      where.status = { not: "Schedule" };
    }

    // Fetch and sort announcements by publishDateTime (or createdAt if null), descending
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        {
          publishDateTime: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: { society: true },
    });

    // Resort by effective publish date (publishDateTime if set, else createdAt), descending
    announcements.sort((a, b) => {
      const dateA = a.publishDateTime
        ? new Date(a.publishDateTime)
        : new Date(a.createdAt);
      const dateB = b.publishDateTime
        ? new Date(b.publishDateTime)
        : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return announcements;
  }

  static async getAnnouncementById(announcementId: string) {
    return prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { society: true },
    });
  }

  static async updateAnnouncement(announcementId: string, updateData: any) {
    // Fetch the current announcement and its society
    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { society: true },
    });
    if (!existing) return null;

    // Check if sendEmail is being changed from false to true
    const sendEmailWasFalse = existing.sendEmail === false;
    const sendEmailNowTrue = updateData.sendEmail === true;

    // Update the announcement
    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
      include: { society: true },
    });

    // If sendEmail changed from false to true, send emails now
    if (sendEmailWasFalse && sendEmailNowTrue) {
      await AnnouncementService.sendAnnouncementNotificationsAndEmails(
        updated,
        updated.society
      );
    }

    return updated;
  }

  static async deleteAnnouncement(announcementId: string) {
    const deleted = await prisma.announcement
      .delete({
        where: { id: announcementId },
      })
      .catch(() => null);
    return deleted;
  }
}
