import cron from "node-cron";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { deleteFromCloudinary } from "../utils/cloudinary";
import { AnnouncementService } from "./announcement.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";
import pushNotificationService from "./push-notification.service";
import { PushTokenService } from "./push-token.service";

interface JobConfig {
  batchSize: number;
  maxRetries: number;
  retentionDays: number;
  enableDryRun: boolean;
  maxConcurrentOperations: number;
}

interface JobStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: string[];
  duration: number;
}

const DEFAULT_JOB_CONFIG: JobConfig = {
  batchSize: 1000,
  maxRetries: 3,
  retentionDays: 30,
  enableDryRun: false,
  maxConcurrentOperations: 5,
};

// Enhanced in-memory cache with TTL
class ReminderCache {
  private cache = new Map<string, { timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  add(key: string, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { timestamp: Date.now(), ttl });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const sentReminders = new ReminderCache();

// Job registry for monitoring and control
const jobRegistry = new Map<
  string,
  {
    isRunning: boolean;
    lastRun: Date | null;
    lastStats: JobStats | null;
    failures: number;
  }
>();

/**
 * Initialize all background jobs with enhanced configuration
 */
export const initializeBackgroundJobs = (config: Partial<JobConfig> = {}) => {
  const finalConfig = { ...DEFAULT_JOB_CONFIG, ...config };

  logger.info("Initializing background jobs...", { config: finalConfig });

  // Register jobs
  registerJob("cleanup", scheduleCleanup, finalConfig);
  registerJob("publishing", schedulePublishing, finalConfig);
  registerJob("eventStatusUpdates", scheduleEventStatusUpdates, finalConfig);
  registerJob("eventReminders", scheduleEventReminders, finalConfig);

  // Schedule cache cleanup every hour
  cron.schedule("0 * * * *", () => {
    sentReminders.cleanup();
    logger.debug(
      `Cache cleanup completed. Cache size: ${sentReminders.size()}`
    );
  });

  logger.info("All background jobs scheduled successfully");
};

/**
 * Register a job in the registry for monitoring
 */
function registerJob(name: string, jobFunction: Function, config: JobConfig) {
  jobRegistry.set(name, {
    isRunning: false,
    lastRun: null,
    lastStats: null,
    failures: 0,
  });

  jobFunction(config);
}

/**
 * Wrapper for job execution with monitoring and error handling
 */
async function executeJob<T>(
  jobName: string,
  jobFunction: () => Promise<T>,
  retries: number = DEFAULT_JOB_CONFIG.maxRetries
): Promise<T | null> {
  const jobInfo = jobRegistry.get(jobName);
  if (!jobInfo) {
    throw new Error(`Job ${jobName} not registered`);
  }

  if (jobInfo.isRunning) {
    logger.warn(`Job ${jobName} is already running, skipping execution`);
    return null;
  }

  jobInfo.isRunning = true;
  const startTime = Date.now();

  try {
    logger.info(`Starting job: ${jobName}`);
    const result = await jobFunction();

    const duration = Date.now() - startTime;
    jobInfo.lastRun = new Date();
    jobInfo.failures = 0; // Reset failure count on success

    logger.info(`Job ${jobName} completed successfully`, {
      duration: `${duration}ms`,
      result: typeof result === "object" ? JSON.stringify(result) : result,
    });

    return result;
  } catch (error) {
    jobInfo.failures++;
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    logger.error(`Job ${jobName} failed`, {
      error: errorMsg,
      duration: `${duration}ms`,
      attempt: jobInfo.failures,
      maxRetries: retries,
    });

    // Retry logic
    if (jobInfo.failures < retries) {
      logger.info(`Retrying job ${jobName} in 30 seconds...`);
      setTimeout(() => executeJob(jobName, jobFunction, retries), 30000);
    }

    throw error;
  } finally {
    jobInfo.isRunning = false;
  }
}

/**
 * Enhanced cleanup job with batch processing
 */
const scheduleCleanup = (config: JobConfig) => {
  cron.schedule("0 0 * * *", () => {
    executeJob("cleanup", async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

      const stats: JobStats = {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        duration: 0,
      };

      const startTime = Date.now();

      try {
        // Cleanup join requests with batch processing
        const joinRequestStats = await cleanupJoinRequestsBatch(
          cutoffDate,
          config
        );
        stats.totalProcessed += joinRequestStats.totalProcessed;
        stats.successful += joinRequestStats.successful;
        stats.errors.push(...joinRequestStats.errors);

        // Cleanup meetings
        const meetingResult = await prisma.meeting.deleteMany({
          where: {
            status: { in: ["CANCELLED", "ENDED"] },
            createdAt: { lt: cutoffDate },
          },
        });
        stats.totalProcessed += meetingResult.count;
        stats.successful += meetingResult.count;

        // Cleanup push tokens
        const tokenCleanupResult = await PushTokenService.cleanupInactiveTokens(
          config.retentionDays
        );
        stats.totalProcessed += tokenCleanupResult.count;
        stats.successful += tokenCleanupResult.count;

        stats.duration = Date.now() - startTime;

        logger.info("Cleanup job completed", stats);
        return stats;
      } catch (error) {
        stats.duration = Date.now() - startTime;
        stats.errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
        throw error;
      }
    });
  });
};

/**
 * Batch processing for join request cleanup
 */
async function cleanupJoinRequestsBatch(cutoffDate: Date, config: JobConfig) {
  const stats = { totalProcessed: 0, successful: 0, errors: [] as string[] };
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    try {
      const batch = await prisma.joinRequest.findMany({
        where: {
          status: { not: "PENDING" },
          createdAt: { lt: cutoffDate },
        },
        select: { id: true, pdf: true },
        take: config.batchSize,
        skip: offset,
        orderBy: { createdAt: "asc" },
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      const recordIds = batch.map((r) => r.id);
      const pdfUrls = batch.filter((r) => r.pdf).map((r) => r.pdf!);

      // Delete records
      const deleteResult = await prisma.joinRequest.deleteMany({
        where: { id: { in: recordIds } },
      });

      stats.totalProcessed += deleteResult.count;
      stats.successful += deleteResult.count;

      // Delete PDFs with controlled concurrency
      if (pdfUrls.length > 0) {
        const pdfResults = await deletePDFsConcurrently(
          pdfUrls,
          config.maxConcurrentOperations
        );
        stats.errors.push(...pdfResults.errors);
      }

      offset += config.batchSize;
      await sleep(100); // Small delay between batches
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      stats.errors.push(`Batch cleanup failed: ${errorMsg}`);
      break;
    }
  }

  return stats;
}

/**
 * Enhanced publishing job with better error handling
 */
const schedulePublishing = (config: JobConfig) => {
  cron.schedule("*/5 * * * *", () => {
    executeJob("publishing", async () => {
      const now = new Date();
      const stats = { events: 0, announcements: 0, errors: [] as string[] };

      try {
        // Process events
        const eventsToPublish = await prisma.event.findMany({
          where: {
            visibility: "Schedule",
            publishDateTime: { lte: now },
          },
          take: config.batchSize, // Limit batch size
        });

        for (const event of eventsToPublish) {
          try {
            const updatedEvent = await prisma.event.update({
              where: { id: event.id },
              data: { visibility: "Publish" },
            });

            // Use dynamic import to avoid circular dependency
            const { EventNotificationService } = await import(
              "./event-notification.service.js"
            );
            const eventNotificationService = new EventNotificationService();
            await eventNotificationService.sendEventNotification(updatedEvent);
            stats.events++;
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            stats.errors.push(
              `Failed to publish event ${event.id}: ${errorMsg}`
            );
          }
        }

        // Process announcements
        const announcementsToPublish = await prisma.announcement.findMany({
          where: {
            status: "Schedule",
            publishDateTime: { lte: now },
          },
          include: { society: true },
          take: config.batchSize,
        });

        for (const announcement of announcementsToPublish) {
          try {
            await prisma.announcement.update({
              where: { id: announcement.id },
              data: { status: "Publish" },
            });

            await AnnouncementService.sendAnnouncementNotificationsAndEmails(
              announcement,
              announcement.society
            );
            stats.announcements++;
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            stats.errors.push(
              `Failed to publish announcement ${announcement.id}: ${errorMsg}`
            );
          }
        }

        return stats;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        stats.errors.push(`Publishing job failed: ${errorMsg}`);
        throw error;
      }
    });
  });
};

/**
 * Enhanced event status updates with batch processing
 */
const scheduleEventStatusUpdates = (config: JobConfig) => {
  cron.schedule("*/5 * * * *", () => {
    executeJob("eventStatusUpdates", async () => {
      const now = new Date();

      const [ongoingResult, completedResult] = await Promise.all([
        prisma.event.updateMany({
          where: {
            status: "Upcoming",
            startDate: { lte: now },
            endDate: { gt: now },
          },
          data: { status: "Ongoing" },
        }),
        prisma.event.updateMany({
          where: {
            status: { in: ["Upcoming", "Ongoing"] },
            endDate: { lte: now },
          },
          data: { status: "Completed" },
        }),
      ]);

      return {
        ongoing: ongoingResult.count,
        completed: completedResult.count,
        total: ongoingResult.count + completedResult.count,
      };
    });
  });
};

/**
 * Enhanced event reminders with optimized processing
 */
const scheduleEventReminders = (config: JobConfig) => {
  cron.schedule("*/10 * * * *", () => {
    executeJob("eventReminders", async () => {
      const now = new Date();
      const stats = { reminders: 0, events: 0, errors: [] as string[] };

      // Fetch upcoming events with pagination
      const upcomingEvents = await prisma.event.findMany({
        where: {
          status: "Upcoming",
          isDraft: false,
          startDate: {
            gte: now,
            lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next 24 hours
          },
        },
        take: config.batchSize,
        orderBy: { startDate: "asc" },
      });

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
        try {
          if (!event.startDate) continue;

          const [startHour, startMinute] = (event.startTime || "00:00")
            .split(":")
            .map(Number);
          const eventStart = new Date(event.startDate);
          eventStart.setHours(startHour, startMinute, 0, 0);

          const diffMinutes = Math.floor(
            (eventStart.getTime() - now.getTime()) / 60000
          );

          for (const interval of intervals) {
            if (
              diffMinutes <= interval.min &&
              diffMinutes > interval.min - 10
            ) {
              const reminderKey = `${event.id}_${interval.min}`;

              if (sentReminders.has(reminderKey)) continue;
              sentReminders.add(reminderKey, 2 * 60 * 60 * 1000); // 2 hour TTL

              const success = await sendEventReminder(
                event,
                interval,
                diffMinutes
              );
              if (success) {
                stats.reminders++;
              } else {
                stats.errors.push(
                  `Failed to send reminder for event ${event.id}`
                );
              }
            }
          }

          stats.events++;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          stats.errors.push(`Error processing event ${event.id}: ${errorMsg}`);
        }
      }

      return stats;
    });
  });
};

/**
 * Send event reminder with improved error handling
 */
async function sendEventReminder(
  event: any,
  interval: any,
  diffMinutes: number
): Promise<boolean> {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: event.id },
      select: { studentId: true },
    });

    if (!registrations.length) return true; // No recipients, consider successful

    const recipients = registrations.map((r) => ({
      recipientType: "student" as const,
      recipientId: r.studentId,
    }));

    const timeStr = event.startTime || "";
    const message = interval.msg(event.title, timeStr);

    // Dynamic import to avoid circular dependency
    const { createNotification } = await import("./notification.service.js");

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
      // Send notifications concurrently
      await Promise.all([
        sendNotificationToUsers(io, recipients, notification),
        pushNotificationService.sendToRecipients(recipients, {
          title: notification.title,
          body: notification.description,
        }),
      ]);

      logger.info(
        `Sent '${interval.label}' reminder for event '${event.title}' to ${recipients.length} participants.`
      );
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Failed to send reminder for event ${event.id}:`, error);
    return false;
  }
}

/**
 * Delete PDFs with controlled concurrency
 */
async function deletePDFsConcurrently(urls: string[], maxConcurrency: number) {
  const stats = { deleted: 0, errors: [] as string[] };

  for (let i = 0; i < urls.length; i += maxConcurrency) {
    const chunk = urls.slice(i, i + maxConcurrency);
    const results = await Promise.allSettled(
      chunk.map(async (url) => {
        try {
          await deleteFromCloudinary(url);
          return { success: true, url };
        } catch (error) {
          return {
            success: false,
            url,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          stats.deleted++;
        } else {
          stats.errors.push(
            `Failed to delete ${result.value.url}: ${result.value.error}`
          );
        }
      }
    });

    // Small delay between chunks
    if (i + maxConcurrency < urls.length) {
      await sleep(200);
    }
  }

  return stats;
}

/**
 * Utility functions
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get job status for monitoring
 */
export function getJobStatuses() {
  const statuses: Record<string, any> = {};

  for (const [jobName, jobInfo] of jobRegistry.entries()) {
    statuses[jobName] = {
      isRunning: jobInfo.isRunning,
      lastRun: jobInfo.lastRun,
      failures: jobInfo.failures,
      lastStats: jobInfo.lastStats,
    };
  }

  return {
    jobs: statuses,
    cacheSize: sentReminders.size(),
    uptime: process.uptime(),
  };
}

/**
 * Manual job execution for testing/emergency
 */
export async function executeJobManually(jobName: string) {
  const jobInfo = jobRegistry.get(jobName);
  if (!jobInfo) {
    throw new Error(`Job ${jobName} not found`);
  }

  logger.info(`Manually executing job: ${jobName}`);
  // This would need to be implemented based on the specific job
  // For now, return the job info
  return jobInfo;
}

/**
 * Graceful shutdown
 */
export function shutdownBackgroundJobs() {
  logger.info("Shutting down background jobs...");
  sentReminders.clear();
  jobRegistry.clear();
}
