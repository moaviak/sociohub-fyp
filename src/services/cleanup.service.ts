import cron from "node-cron";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { deleteFromCloudinary } from "../utils/cloudinary";

/**
 * Schedule all cleanup and maintenance jobs
 */
export const initializeCleanupJobs = () => {
  // Schedule join request cleanup
  scheduleJoinRequestCleanup();
  // Schedule event publishing
  scheduleEventPublishing();
  // Schedule event status updates
  scheduleEventStatusUpdates();

  logger.info("All cleanup jobs scheduled");
};

/**
 * Scheduled cleanup job that runs at midnight (00:00) daily to delete old join requests
 * - Deletes join requests that are older than 30 days and don't have "PENDING" status
 * - Also cleans up associated PDF files from Cloudinary
 */
const scheduleJoinRequestCleanup = () => {
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
      const { count } = await prisma.joinRequest.deleteMany({
        where: {
          status: { not: "PENDING" },
          createdAt: { lt: thirtyDaysAgo },
        },
      });

      // Delete PDF files from Cloudinary
      const pdfDeletionPromises = oldRequests
        .filter((request) => request.pdf) // Only delete if PDF exists
        .map((request) => deleteFromCloudinary(request.pdf!));

      await Promise.all(pdfDeletionPromises);

      logger.info(
        `Cleanup completed: Deleted ${count} join requests older than 30 days`
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
const scheduleEventPublishing = () => {
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
    } catch (error) {
      logger.error("Error during scheduled event publishing:", error);
    }
  });
  logger.info("Event publishing job scheduled");
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
