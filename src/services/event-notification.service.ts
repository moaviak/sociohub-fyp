import { Event } from "@prisma/client";
import prisma from "../db";
import { createNotification } from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";
import pushNotificationService from "./push-notification.service";

export class EventNotificationService {
  async sendEventNotification(event: Event) {
    try {
      // Only send notifications for non-draft events
      if (event.visibility === "Draft") {
        return;
      }

      // If audience is Invite, do not send notification
      if (event.audience === "Invite") {
        return;
      }

      // Get society details
      const society = await prisma.society.findUnique({
        where: { id: event.societyId },
        select: { name: true },
      });

      // Determine recipients based on audience
      let recipients: { recipientType: "student"; recipientId: string }[] = [];
      if (event.audience === "Open") {
        // All students
        const students = await prisma.student.findMany({
          select: { id: true },
        });
        recipients = students.map((student) => ({
          recipientType: "student" as const,
          recipientId: student.id,
        }));
      } else if (event.audience === "Members") {
        // Only society members
        const members = await prisma.studentSociety.findMany({
          where: { societyId: event.societyId },
          select: { studentId: true },
        });
        recipients = members.map((member) => ({
          recipientType: "student" as const,
          recipientId: member.studentId,
        }));
      }

      if (recipients.length === 0) {
        // No one to notify
        return;
      }

      // Format notification data based on event visibility
      const isScheduled = event.visibility === "Schedule";
      const notificationTitle = isScheduled
        ? `New Event Scheduled: ${event.title}`
        : `New Event: ${event.title}`;

      const notificationDescription = isScheduled
        ? `${society?.name || "A society"} has scheduled a new event "${
            event.title
          }" that will be published on ${event.publishDateTime?.toLocaleDateString()}`
        : `${society?.name || "A society"} has published a new event "${
            event.title
          }"${event.tagline ? `: ${event.tagline}` : ""}`;

      // Create notification for recipients
      const notification = await createNotification({
        title: notificationTitle,
        description: notificationDescription,
        image: event.banner || undefined,
        webRedirectUrl: `/event/${event.id}`,
        mobileRedirectUrl: {
          pathname: "/event/[id]",
          params: { id: event.id },
        },
        recipients,
      });

      // If notification was created successfully and we have socket.io instance
      if (notification && io) {
        sendNotificationToUsers(io, recipients, notification);
        pushNotificationService.sendToRecipients(recipients, {
          title: notification.title,
          body: notification.description,
        });
      }

      return notification;
    } catch (error) {
      console.error("Error sending event notification:", error);
      // Don't throw error as this is a non-critical operation
      return null;
    }
  }
}
