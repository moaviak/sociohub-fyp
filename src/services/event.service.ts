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
import { uploadOnCloudinary } from "../utils/cloudinary";

const prisma = new PrismaClient();

interface CreateEventInput {
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
      });

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
}
