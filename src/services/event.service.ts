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
import QRCode from "qrcode";
import { sendEventRegistrationConfirmationEmail } from "../utils/mail";

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
  startTime: string;
  endTime: string;
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
      } // Convert date strings and time strings to complete DateTime
      const [startHours, startMinutes] = input.startTime.split(":").map(Number);
      const [endHours, endMinutes] = input.endTime.split(":").map(Number);

      const startDateTime = new Date(input.startDate);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(input.endDate);
      endDateTime.setHours(endHours, endMinutes);

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
          startTime: input.startTime,
          endTime: input.endTime,
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
          isDraft: false,
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
        startTime: "00:00",
        endTime: "00:00",
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

  static async getEvents(
    societyId: string | undefined,
    filters?: {
      status?: "Upcoming" | "Past" | "Draft";
      categories?: EventCategories[];
      search?: string;
    },
    user?: {
      id: string;
      isMember?: boolean;
      hasEventsPrivilege?: boolean;
    }
  ) {
    try {
      const now = new Date();
      const whereClause: any = {};

      // Only add societyId filter if provided
      if (societyId) {
        whereClause.societyId = societyId;
      }

      // Apply user context globally (not just per society)
      if (!user || user.isMember === false) {
        // Non-members can only see published/scheduled events, never drafts
        whereClause.visibility = { in: ["Publish", "Schedule"] };
        whereClause.isDraft = false;
        whereClause.OR = [
          { publishDateTime: null },
          { publishDateTime: { lte: now } },
        ];
      } else if (user.hasEventsPrivilege === false) {
        // Members without events privilege can't see drafts
        whereClause.isDraft = false;
      }
      // Members with events privilege can see everything, so no extra conditions needed

      // Only apply filters if they are provided
      if (filters && Object.keys(filters).length > 0) {
        // Add status filter if provided
        if (filters.status) {
          switch (filters.status) {
            case "Upcoming":
              whereClause.OR = [
                {
                  AND: [
                    { startDate: { gte: now } },
                    { status: EventStatus.Upcoming },
                  ],
                },
                { status: EventStatus.Ongoing },
              ];
              whereClause.isDraft = false; // Never show drafts for Upcoming
              break;
            case "Past":
              whereClause.AND = [
                {
                  status: {
                    in: [EventStatus.Completed, EventStatus.Cancelled],
                  },
                },
                { isDraft: false }, // Past events should never be drafts
              ];
              break;
            case "Draft":
              if (user?.hasEventsPrivilege) {
                whereClause.isDraft = true;
              } else {
                // If user doesn't have events privilege, return nothing for draft filter
                return [];
              }
              break;
          }
        }

        // Add categories filter if provided
        if (filters.categories && filters.categories.length > 0) {
          whereClause.categories = { hasSome: filters.categories };
        }

        // Add search filter if provided
        if (filters.search) {
          const searchCondition = {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              {
                description: { contains: filters.search, mode: "insensitive" },
              },
              { tagline: { contains: filters.search, mode: "insensitive" } },
            ],
          };

          // Combine search with existing conditions
          whereClause.AND = whereClause.AND || [];
          whereClause.AND.push(searchCondition);
        }
      }

      // Debug log
      console.log("User context:", user);
      console.log("Filters:", filters);
      console.log("Where clause:", JSON.stringify(whereClause, null, 2));

      const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: [
          { isDraft: "asc" },
          { startDate: "asc" },
          { startTime: "asc" },
        ],
      });

      // Debug log
      console.log("Found events count:", events.length);

      return events;
    } catch (error: any) {
      throw new ApiError(500, "Error fetching events: " + error.message);
    }
  }

  static async getEventById(eventId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          society: true,
          _count: { select: { eventRegistrations: true } },
        },
      });
      return event;
    } catch (error: any) {
      throw new ApiError(500, "Error fetching event: " + error.message);
    }
  }

  static async updateEvent(
    eventId: string,
    update: Partial<CreateEventInput & { banner?: string }>
  ) {
    try {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      // Handle banner upload if provided and is a local path
      let bannerUrl = update.banner;
      if (update.banner && update.banner !== event.banner) {
        // Optionally upload to Cloudinary (reuse logic from createEvent)
        const society = await prisma.society.findUnique({
          where: { id: event.societyId },
        });
        if (society) {
          const uploadResult = await uploadOnCloudinary(
            update.banner,
            `${society.name}/events`
          );
          if (uploadResult?.secure_url) {
            bannerUrl = uploadResult.secure_url;
          }
        }
      }

      // Determine new status if not a draft and if enough info is present
      let newStatus = event.status;
      const prevVisibility = event.visibility;
      const newVisibility = update.visibility ?? event.visibility;
      if (newVisibility === "Publish" || newVisibility === "Schedule") {
        newStatus = "Upcoming";
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...update,
          ...(bannerUrl ? { banner: bannerUrl } : {}),
          status: newStatus,
        },
      });

      if (
        prevVisibility === "Draft" &&
        (newVisibility === "Publish" || newVisibility === "Schedule")
      ) {
        sendEventNotification(event);
      }
      return updatedEvent;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating event: " + error.message);
    }
  }

  static async registerForEvent({
    eventId,
    studentId,
  }: {
    eventId: string;
    studentId: string;
  }) {
    // Fetch event with all required fields
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { society: true },
    });
    if (!event) throw new ApiError(404, "Event not found");

    // 0. Event shouldn't be draft
    if (event.visibility === "Draft") {
      throw new ApiError(400, "Cannot register a draft event.");
    }

    // 1. Registration must be enabled
    if (!event.registrationRequired)
      throw new ApiError(400, "Registration is not required for this event");
    // 2. Event must be published
    if (event.visibility !== "Publish")
      throw new ApiError(400, "Event is not open for registration");
    // 3. Registration deadline must not be passed
    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) < new Date()
    )
      throw new ApiError(400, "Registration deadline has passed");
    // 4. Event status must be Upcoming
    if (event.status !== "Upcoming")
      throw new ApiError(400, "Event is not open for registration");
    // 5. Student must be eligible for audience
    if (event.audience === "Members") {
      const isMember = await prisma.studentSociety.findFirst({
        where: { studentId, societyId: event.societyId },
      });
      if (!isMember)
        throw new ApiError(
          403,
          "You must be a member of the society to register for this event"
        );
    }
    if (event.audience === "Invite") {
      // TOOD: Complete this when implemented Event Invites
      throw new ApiError(403, "This event is invite-only");
    }
    // 6. Check for duplicate registration
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId, studentId },
    });
    if (existing)
      throw new ApiError(409, "You have already registered for this event");
    // 7. Check max participants
    if (event.maxParticipants) {
      const count = await prisma.eventRegistration.count({
        where: { eventId },
      });
      if (count >= event.maxParticipants)
        throw new ApiError(400, "Event has reached maximum participants");
    }
    // 8. Create registration
    let ticket = null;
    let registration = await prisma.eventRegistration.create({
      data: { eventId, studentId },
    });
    // 9. If event is physical, generate ticket
    let ticketQrCode: string | undefined = undefined;
    let entryInstructions: string | undefined = undefined;
    if (event.eventType === "Physical") {
      // QR data: registrationId, eventId, studentId, eventTitle, societyName
      const qrPayload = {
        registrationId: registration.id,
        eventId,
        studentId,
        eventTitle: event.title,
        societyName: event.society.name,
      };
      ticketQrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));
      ticket = await prisma.eventTicket.create({
        data: {
          registrationId: registration.id,
          qrCode: ticketQrCode,
        },
      });
      // Link ticket to registration
      registration = await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { ticket: { connect: { id: ticket.id } } },
        include: { ticket: true },
      });
      entryInstructions =
        "Please present the attached QR code at the event entrance. This ticket allows one-time entry only. Do not share your QR code with others.";
    }
    // Fetch student info for email
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (student) {
      await sendEventRegistrationConfirmationEmail(String(student.email), {
        studentName: student.firstName + " " + student.lastName,
        eventTitle: event.title,
        eventStartDate: event.startDate?.toLocaleDateString() ?? "",
        eventEndDate: event.endDate?.toLocaleDateString() ?? "",
        eventStartTime: event.startTime ?? undefined,
        eventEndTime: event.endTime ?? undefined,
        eventVenue: event.venueName || event.venueAddress || undefined,
        eventType: event.eventType || "",
        societyName: event.society.name,
        ticketQrCode,
        entryInstructions,
        platform: event.platform ?? undefined,
        meetingLink: event.meetingLink ?? undefined,
        accessInstructions: event.accessInstructions ?? undefined,
      });
    }
    return registration;
  }

  static async getUserEventRegistrations(userId: string, eventIds: string[]) {
    return prisma.eventRegistration.findMany({
      where: {
        studentId: userId,
        eventId: { in: eventIds },
      },
      select: { eventId: true },
    });
  }

  static async deleteEvent(eventId: string) {
    try {
      // Find the event
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      // Only allow deletion if event is a draft
      if (event.visibility !== "Draft") {
        throw new ApiError(400, "Only draft events can be deleted");
      }

      // Delete banner from Cloudinary if exists
      if (event.banner) {
        try {
          await deleteFromCloudinary(event.banner);
        } catch (e) {
          // Log error but do not block
        }
      }

      // Delete the event itself (no need to delete tickets/registrations for drafts)
      const deletedEvent = await prisma.event.delete({
        where: { id: eventId },
      });
      return deletedEvent;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error deleting event: " + error.message);
    }
  }

  static async cancelEvent(eventId: string) {
    try {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new ApiError(404, "Event not found");
      }
      // Only allow cancellation for Upcoming or Schedule events
      if (
        event.visibility === "Draft" ||
        event.status === "Completed" ||
        event.status === "Cancelled"
      ) {
        throw new ApiError(
          400,
          "Only upcoming or scheduled events can be cancelled"
        );
      }
      const cancelledEvent = await prisma.event.update({
        where: { id: eventId },
        data: { status: "Cancelled" },
      });

      // Fetch all registrations for this event
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        select: { studentId: true },
      });
      const studentRecipients = registrations.map((r) => ({
        recipientType: "student" as const,
        recipientId: r.studentId,
      }));

      // Delete all registrations for this event
      await prisma.eventRegistration.deleteMany({ where: { eventId } });

      // Send notifications in background
      (async () => {
        if (studentRecipients.length > 0) {
          const notification = await createNotification({
            title: `Event Cancelled: ${event.title}`,
            description: `The event "${event.title}" has been cancelled. We apologize for any inconvenience.`,
            image: event.banner || undefined,
            webRedirectUrl: `/event/${event.id}`,
            mobileRedirectUrl: `event/${event.id}`,
            recipients: studentRecipients,
          });
          if (notification && io) {
            sendNotificationToUsers(io, studentRecipients, notification);
          }
        }
      })();

      return cancelledEvent;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error cancelling event: " + error.message);
    }
  }

  /**
   * Fetch all events a user is registered for, including ticket info
   */
  static async getUserRegisteredEvents(userId: string) {
    // Find all registrations for the user, including event and ticket
    const registrations = await prisma.eventRegistration.findMany({
      where: { studentId: userId },
      include: {
        event: {
          include: {
            society: true,
            _count: { select: { eventRegistrations: true } },
          },
        },
        ticket: true,
      },
      orderBy: { registeredAt: "desc" },
    });
    // Map to return event info with registration and ticket
    return registrations.map((reg) => ({
      ...reg.event,
      registration: {
        id: reg.id,
        registeredAt: reg.registeredAt,
        ticket: reg.ticket,
      },
    }));
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
      mobileRedirectUrl: `event/${event.id}`,
      recipients,
    });

    // If notification was created successfully and we have socket.io instance
    if (notification && io) {
      sendNotificationToUsers(io, recipients, notification);
    }

    return notification;
  } catch (error) {
    console.error("Error sending event notification:", error);
    // Don't throw error as this is a non-critical operation
    return null;
  }
};
