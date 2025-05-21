import {
  PrismaClient,
  Event,
  EventCategories,
  EventType,
  EventAudience,
  EventVisibility,
  EventStatus,
  PaymentMethods,
} from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { createNotification } from "./notification.service";
import { io } from "../app";
import { sendNotificationToUsers } from "../socket";

const prisma = new PrismaClient();

export interface CreateEventInput {
  societyId: string;
  title: string;
  tagline?: string;
  description?: string;
  categories: EventCategories[];
  banner?: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  eventType: EventType;
  venueName?: string;
  venueAddress?: string;
  platform?: string;
  meetingLink?: string;
  accessInstructions?: string;
  audience: EventAudience;
  visibility: EventVisibility;
  publishDateTime?: Date;
  registrationRequired?: boolean;
  registrationDeadline?: Date;
  maxParticipants?: number;
  paidEvent?: boolean;
  ticketPrice?: number;
  paymentMethods?: PaymentMethods[];
  announcementEnabled?: boolean;
  announcement?: string;
  isDraft?: boolean;
  formStep?: number;
}

export interface DraftEventInput
  extends Partial<Omit<CreateEventInput, "societyId">> {
  societyId: string;
}

export class EventService {
  static async createEvent(input: CreateEventInput): Promise<Event> {
    try {
      // Validate society exists
      const society = await prisma.society.findUnique({
        where: { id: input.societyId },
      });

      if (!society) {
        throw new ApiError(404, "Society not found");
      }

      // Convert date strings to Date objects
      const startDateTime = new Date(input.startDate);
      startDateTime.setHours(
        new Date(input.startTime).getHours(),
        new Date(input.startTime).getMinutes()
      );

      const endDateTime = new Date(input.endDate);
      endDateTime.setHours(
        new Date(input.endTime).getHours(),
        new Date(input.endTime).getMinutes()
      );

      // Validate dates
      const now = new Date();
      if (startDateTime < now) {
        throw new ApiError(400, "Event start date cannot be in the past");
      }

      if (endDateTime <= startDateTime) {
        throw new ApiError(400, "Event end date must be after start date");
      }

      // Determine event status
      let status: EventStatus = EventStatus.Upcoming;
      if (startDateTime <= now && endDateTime > now) {
        status = EventStatus.Ongoing;
      } else if (endDateTime <= now) {
        status = EventStatus.Completed;
      }

      // If it's a scheduled post, validate publish date
      if (input.visibility === "Schedule" && !input.publishDateTime) {
        throw new ApiError(
          400,
          "Publish date is required for scheduled events"
        );
      } // Validate registration deadline if registration is required
      if (input.registrationRequired && !input.registrationDeadline) {
        throw new ApiError(
          400,
          "Registration deadline is required when registration is enabled"
        );
      }

      // Validate registration deadline is before event start
      if (
        input.registrationDeadline &&
        input.registrationDeadline >= startDateTime
      ) {
        throw new ApiError(
          400,
          "Registration deadline must be before the event start date and time"
        );
      }

      // Validate paid event details
      if (input.paidEvent) {
        if (!input.ticketPrice || input.ticketPrice <= 0) {
          throw new ApiError(
            400,
            "Valid ticket price is required for paid events"
          );
        }
        if (!input.paymentMethods || input.paymentMethods.length === 0) {
          throw new ApiError(
            400,
            "At least one payment method is required for paid events"
          );
        }
      }

      // Create the event
      const event = await prisma.event.create({
        data: {
          societyId: input.societyId,
          title: input.title,
          tagline: input.tagline,
          description: input.description,
          categories: input.categories,
          startDate: input.startDate,
          endDate: input.endDate,
          startTime: startDateTime,
          endTime: endDateTime,
          eventType: input.eventType,
          venueName: input.venueName,
          venueAddress: input.venueAddress,
          platform: input.platform,
          meetingLink: input.meetingLink,
          accessInstructions: input.accessInstructions,
          audience: input.audience,
          visibility: input.visibility,
          publishDateTime: input.publishDateTime,
          registrationRequired: input.registrationRequired ?? false,
          registrationDeadline: input.registrationDeadline,
          maxParticipants: input.maxParticipants,
          paidEvent: input.paidEvent ?? false,
          ticketPrice: input.ticketPrice,
          paymentMethods: input.paymentMethods,
          announcementEnabled: input.announcementEnabled ?? false,
          announcement: input.announcement,
          status,
          isDraft: input.isDraft ?? false,
          formStep: input.formStep,
        },
        include: {
          society: true, // Include society details for notification
        },
      });

      // Send notification if event is not a draft
      if (event.visibility !== "Draft") {
        sendEventNotification(event);
      }

      (async () => {
        // Handle banner upload to Cloudinary if provided
        let bannerUrl: string | undefined;
        if (input.banner) {
          const uploadResult = await uploadOnCloudinary(
            input.banner,
            `${society.name}/events`
          );
          bannerUrl = uploadResult?.secure_url;

          await prisma.event.update({
            where: { id: event.id },
            data: { banner: bannerUrl },
          });
        }
      })();

      return event;
    } catch (error) {
      // No need to manually delete the file as uploadOnCloudinary handles cleanup
      throw error;
    }
  }
  static async saveDraft(
    input: DraftEventInput,
    societyId: string,
    formStep: number,
    eventId?: string
  ) {
    try {
      const defaultData = {
        title: "",
        categories: [],
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        eventType: EventType.Physical,
        audience: EventAudience.Open,
        visibility: EventVisibility.Draft,
      };

      const data = {
        ...defaultData,
        ...input,
        societyId,
        formStep,
        isDraft: true,
      };

      let updatedDraft;
      if (eventId) {
        // Update existing draft
        updatedDraft = await prisma.event.update({
          where: { id: eventId },
          data,
        });

        // Handle banner replacement in background
        if (input.banner) {
          (async () => {
            // Fetch previous draft to get old banner
            const prevDraft = await prisma.event.findUnique({
              where: { id: eventId },
            });
            if (
              prevDraft &&
              prevDraft.banner &&
              prevDraft.banner !== input.banner
            ) {
              try {
                await deleteFromCloudinary(prevDraft.banner);
              } catch (e) {
                // Log error but do not block
              }
            }
            // Upload new banner
            try {
              const society = await prisma.society.findUnique({
                where: { id: societyId },
              });
              if (society) {
                const uploadResult = await uploadOnCloudinary(
                  input.banner!,
                  `${society.name}/events`
                );
                if (uploadResult?.secure_url) {
                  await prisma.event.update({
                    where: { id: eventId },
                    data: { banner: uploadResult.secure_url },
                  });
                }
              }
            } catch (e) {
              // Log error but do not block
            }
          })();
        }
        return updatedDraft;
      } else {
        // Create new draft
        const createdDraft = await prisma.event.create({
          data,
        });
        // Handle banner upload in background
        if (input.banner) {
          (async () => {
            try {
              const society = await prisma.society.findUnique({
                where: { id: societyId },
              });
              if (society) {
                const uploadResult = await uploadOnCloudinary(
                  input.banner!,
                  `${society.name}/events`
                );
                if (uploadResult?.secure_url) {
                  await prisma.event.update({
                    where: { id: createdDraft.id },
                    data: { banner: uploadResult.secure_url },
                  });
                }
              }
            } catch (e) {
              // Log error but do not block
            }
          })();
        }
        return createdDraft;
      }
    } catch (error: any) {
      throw new ApiError(500, "Error saving draft: " + error.message);
    }
  }

  static async getDraft(eventId: string, societyId: string) {
    try {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          societyId,
          isDraft: true,
        },
      });

      if (!event) {
        throw new ApiError(404, "Draft not found");
      }

      return event;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error fetching draft: " + error.message);
    }
  }

  static async getDrafts(societyId: string) {
    try {
      return await prisma.event.findMany({
        where: {
          societyId,
          isDraft: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } catch (error: any) {
      throw new ApiError(500, "Error fetching drafts: " + error.message);
    }
  }
}

/**
 * Send notifications to all students when an event is published
 */
export const sendEventNotification = async (event: Event) => {
  try {
    // Only send notifications for non-draft events
    if (event.visibility === "Draft") {
      return;
    }

    // Get society details
    const society = await prisma.society.findUnique({
      where: { id: event.societyId },
      select: { name: true },
    });

    // Get all students
    const students = await prisma.student.findMany({
      select: {
        id: true,
      },
    });

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

    // Create notification for all students
    const notification = await createNotification({
      title: notificationTitle,
      description: notificationDescription,
      image: event.banner || undefined,
      webRedirectUrl: `/events/${event.id}`,
      mobileRedirectUrl: `event/${event.id}`,
      recipients: students.map((student) => ({
        recipientType: "student" as const,
        recipientId: student.id,
      })),
    });

    // If notification was created successfully and we have socket.io instance
    if (notification && io) {
      sendNotificationToUsers(
        io,
        students.map((student) => ({
          recipientType: "student" as const,
          recipientId: student.id,
        })),
        notification
      );
    }

    return notification;
  } catch (error) {
    console.error("Error sending event notification:", error);
    // Don't throw error as this is a non-critical operation
    return null;
  }
};
