import cron from "node-cron";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { deleteFromCloudinary } from "../utils/cloudinary";
import { AnnouncementService } from "./announcement.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";
import pushNotificationService from "./push-notification.service";

// In-memory cache to avoid duplicate reminders within the same interval (reset on process restart)
const sentReminders = new Set<string>();

/**
 * Schedule all background and maintenance jobs
 */
export const initializeBackgroundJobs = () => {
  // Schedule join request cleanup
  scheduleCleanup();
  // Schedule event publishing
  schedulePublishing();
  // Schedule event status updates
  scheduleEventStatusUpdates();
  scheduleEventReminders();

  logger.info("All background jobs scheduled");
};

/**
 * Scheduled cleanup job that runs at midnight (00:00) daily to delete old join requests
 * - Deletes join requests that are older than 30 days and don't have "PENDING" status
 * - Also cleans up associated PDF files from Cloudinary
 */
const scheduleCleanup = () => {
  // Schedule to run at midnight (00:00) every day
  cron.schedule("0 0 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find old requests with their PDF urls before deletion
      const oldRequests = await prisma.joinRequest.findMany({
        where: {
          status: { not: "PENDING" },
          createdAt: { lt: thirtyDaysAgo },
        },
        select: {
          id: true,
          pdf: true,
        },
      });

      // Delete the records from database
      const [{ count: requestsCount }, { count: meetingCount }] =
        await Promise.all([
          prisma.joinRequest.deleteMany({
            where: {
              status: { not: "PENDING" },
              createdAt: { lt: thirtyDaysAgo },
            },
          }),
          prisma.meeting.deleteMany({
            where: {
              status: {
                in: ["CANCELLED", "ENDED"],
              },
              createdAt: { lt: thirtyDaysAgo },
            },
          }),
        ]);

      // Delete PDF files from Cloudinary
      const pdfDeletionPromises = oldRequests
        .filter((request) => request.pdf) // Only delete if PDF exists
        .map((request) => deleteFromCloudinary(request.pdf!));

      await Promise.all(pdfDeletionPromises);

      logger.info(
        `Cleanup completed: Deleted ${requestsCount} join requests and ${meetingCount} meetings older than 30 days`
      );
    } catch (error) {
      logger.error("Error during join request cleanup:", error);
    }
  });

  logger.info("Join request cleanup job scheduled");
};

/**
 * Scheduled job that runs every 5 minutes to publish scheduled events
 * - Finds events with visibility "Schedule" and publishDateTime in the past
 * - Updates their visibility to "Publish"
 */
const schedulePublishing = () => {
  // Schedule to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date(); // Find scheduled events that need to be published
      const eventsToPublish = await prisma.event.findMany({
        where: {
          visibility: "Schedule",
          publishDateTime: { lte: now },
        },
      });

      // Update each event and send notifications
      for (const event of eventsToPublish) {
        // Update visibility to Publish
        const updatedEvent = await prisma.event.update({
          where: { id: event.id },
          data: { visibility: "Publish" },
        });

        // Import here to avoid circular dependency
        const { sendEventNotification } = require("./event.service");
        sendEventNotification(updatedEvent);
      }

      if (eventsToPublish.length > 0) {
        logger.info(
          `Published ${eventsToPublish.length} scheduled events whose publishDateTime has passed`
        );
      }

      // --- ANNOUNCEMENTS ---
      // Find scheduled announcements that need to be published
      const announcementsToPublish = await prisma.announcement.findMany({
        where: {
          status: "Schedule",
          publishDateTime: { lte: now },
        },
        include: { society: true },
      });

      for (const announcement of announcementsToPublish) {
        // Update status to Publish
        await prisma.announcement.update({
          where: { id: announcement.id },
          data: { status: "Publish" },
        });

        // Use the service function to send notifications and emails
        await AnnouncementService.sendAnnouncementNotificationsAndEmails(
          announcement,
          announcement.society
        );
      }
      if (announcementsToPublish.length > 0) {
        logger.info(
          `Published ${announcementsToPublish.length} scheduled announcements whose publishDateTime has passed`
        );
      }
    } catch (error) {
      logger.error(
        "Error during scheduled event/announcement publishing:",
        error
      );
    }
  });
  logger.info("Event and announcement publishing job scheduled");
};

/**
 * Scheduled job that runs every 5 minutes to update event statuses
 * - Updates events to "Ongoing" if start date/time has passed but not end date/time
 * - Updates events to "Completed" if end date/time has passed
 */
const scheduleEventStatusUpdates = () => {
  // Schedule to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      // Update events to Ongoing where start time has passed but not end time
      const updatedToOngoing = await prisma.event.updateMany({
        where: {
          status: "Upcoming",
          startDate: { lte: now },
          endDate: { gt: now },
        },
        data: {
          status: "Ongoing",
        },
      });

      // Update events to Completed where end time has passed
      const updatedToCompleted = await prisma.event.updateMany({
        where: {
          status: { in: ["Upcoming", "Ongoing"] },
          endDate: { lte: now },
        },
        data: {
          status: "Completed",
        },
      });

      if (updatedToOngoing.count > 0 || updatedToCompleted.count > 0) {
        logger.info(
          `Event status updates: ${updatedToOngoing.count} set to Ongoing, ${updatedToCompleted.count} set to Completed`
        );
      }
    } catch (error) {
      logger.error("Error during event status updates:", error);
    }
  });

  logger.info("Event status update job scheduled");
};

/**
 * Scheduled job that runs every 10 minutes to send event start reminders
 * - Notifies participants at 1 day, 12h, 3h, 1h, 15m, and 5m before event start
 */
const scheduleEventReminders = () => {
  // Schedule to run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();
      // Fetch events starting within the next 1 day
      const upcomingEvents = await prisma.event.findMany({
        where: {
          status: "Upcoming",
          isDraft: false,
          startDate: { gte: now },
        },
      });

      // Reminder intervals in minutes and their message templates
      const intervals = [
        {
          min: 1440,
          label: "1 day",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' is happening tomorrow at ${time}.`,
        },
        {
          min: 720,
          label: "12 hours",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' starts in 12 hours at ${time}.`,
        },
        {
          min: 180,
          label: "3 hours",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' starts in 3 hours at ${time}.`,
        },
        {
          min: 60,
          label: "1 hour",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' starts in 1 hour at ${time}.`,
        },
        {
          min: 15,
          label: "15 minutes",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' starts in 15 minutes at ${time}.`,
        },
        {
          min: 5,
          label: "5 minutes",
          msg: (title: string, time: string) =>
            `Reminder: The event '${title}' starts in 5 minutes at ${time}.`,
        },
      ];

      for (const event of upcomingEvents) {
        // Skip if startDate is null or undefined
        if (!event.startDate) continue;
        // Combine startDate and startTime into a Date object
        const [startHour, startMinute] = (event.startTime || "00:00")
          .split(":")
          .map(Number);
        const eventStart = new Date(event.startDate);
        eventStart.setHours(startHour, startMinute, 0, 0);
        const diffMinutes = Math.floor(
          (eventStart.getTime() - now.getTime()) / 60000
        );

        for (const interval of intervals) {
          // If event is within this interval and not already reminded
          if (
            diffMinutes <= interval.min &&
            diffMinutes > interval.min - 10 // 10 min window
          ) {
            const reminderKey = `${event.id}_${interval.min}`;
            if (sentReminders.has(reminderKey)) continue;
            sentReminders.add(reminderKey);

            // Fetch all participants (students) registered for this event
            const registrations = await prisma.eventRegistration.findMany({
              where: { eventId: event.id },
              select: { studentId: true },
            });
            if (!registrations.length) continue;
            const recipients = registrations.map((r) => ({
              recipientType: "student" as const,
              recipientId: r.studentId,
            }));

            // Format time for message
            const timeStr = event.startTime || "";
            const message = interval.msg(event.title, timeStr);

            // Send notification
            const { createNotification } = require("./notification.service");
            const notification = await createNotification({
              title: `Event Reminder: ${event.title}`,
              description: message,
              image: event.banner || undefined,
              webRedirectUrl: `/event/${event.id}`,
              mobileRedirectUrl: {
                pathname: "/event/[id]",
                params: { id: event.id },
              },
              recipients,
            });

            if (notification) {
              sendNotificationToUsers(io, recipients, notification);
              pushNotificationService.sendToRecipients(recipients, {
                title: notification.title,
                body: notification.description,
              });
            }

            logger.info(
              `Sent '${interval.label}' reminder for event '${event.title}' to ${recipients.length} participants.`
            );
          }
        }
      }
    } catch (error) {
      logger.error("Error during event reminder job:", error);
    }
  });
  logger.info("Event reminder job scheduled");
};
