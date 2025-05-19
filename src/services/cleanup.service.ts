import cron from "node-cron";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { deleteFromCloudinary } from "../utils/cloudinary";

/**
 * Scheduled cleanup job that runs at midnight (00:00) daily to delete old join requests
 * - Deletes join requests that are older than 30 days and don't have "PENDING" status
 * - Also cleans up associated PDF files from Cloudinary
 */
export const scheduleJoinRequestCleanup = () => {
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
