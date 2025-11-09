import {
  Event,
  EventStatus,
  EventCategories,
  EventAudience,
  EventVisibility,
  EventType,
} from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { EventValidator } from "./validators/event.validator";
import { EventRepository } from "./repositories/event.repository";
import { EventNotificationService } from "./event-notification.service";
import { EventRegistrationService } from "./event-registration.service";
import { EventDraftService } from "./event-draft.service";
import { EventFileService } from "./event-file.service";
import { EventAnnouncementService } from "./event-announcement.service";
import { EventStatusService } from "./event-status.service";
import { EventQueryService } from "./event-query.service";
import { EventTicketService } from "./event-ticket.service";
import { EventUtils } from "../utils/event.utils";
import { DateTimeUtils } from "../utils/datetime.utils";
import { AnnouncementService } from "./announcement.service";

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
  announcementEnabled?: boolean;
  announcement?: string;
  isDraft?: boolean;
  formStep?: number;
}

export class EventService {
  private static draftService = new EventDraftService();
  private static registrationService = new EventRegistrationService();
  private static queryService = new EventQueryService();
  private static ticketService = new EventTicketService();
  private static fileService = new EventFileService();
  private static announcementService = new EventAnnouncementService();
  private static statusService = new EventStatusService();
  private static notificationService = new EventNotificationService();

  static async createEvent(input: CreateEventInput): Promise<Event> {
    try {
      // Validate society and payment configuration
      const society = await EventValidator.validateSociety(input.societyId);
      await EventValidator.validatePaymentConfiguration(
        society,
        input.paidEvent
      );

      // Validate event dates and times
      const { startDateTime, endDateTime } = DateTimeUtils.parseEventDateTime(
        input.startDate,
        input.endDate,
        input.startTime,
        input.endTime
      );

      await EventValidator.validateEventDates(startDateTime, endDateTime);
      await EventValidator.validateEventInput(input, startDateTime);

      // Determine event status
      const status = EventUtils.determineEventStatus(
        startDateTime,
        endDateTime
      );

      // Create the event
      const event = await EventRepository.createEvent({
        ...input,
        status,
        isDraft: false,
      });

      // Handle banner upload asynchronously
      if (input.banner) {
        this.fileService.handleBannerUpload(
          event.id,
          input.banner,
          society.name
        );
      }

      // Handle announcement creation
      if (
        input.announcementEnabled &&
        input.announcement &&
        input.visibility !== "Draft"
      ) {
        AnnouncementService.createEventAnnouncement(event);
      }

      // Send notification if not draft
      if (event.visibility !== "Draft") {
        this.notificationService.sendEventNotification(event);
      }

      return event;
    } catch (error) {
      throw error;
    }
  }

  static async updateEvent(
    eventId: string,
    update: Partial<CreateEventInput & { banner?: string }>
  ) {
    try {
      const event = await EventRepository.findEventWithSociety(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      await EventValidator.validatePaymentConfiguration(
        event.society,
        update.paidEvent
      );

      // Handle banner update
      if (update.banner && update.banner !== event.banner) {
        const bannerUrl = await this.fileService.updateBanner(
          update.banner,
          event.society.name,
          event.banner ?? undefined
        );
        update.banner = bannerUrl;
      }

      // Update event status if needed
      const newStatus = this.statusService.determineUpdatedStatus(
        event,
        update
      );

      const updatedEvent = await EventRepository.updateEvent(eventId, {
        ...update,
        status: newStatus,
      });

      // Handle announcement updates
      await AnnouncementService.handleEventAnnouncementUpdate(
        event,
        updatedEvent,
        update
      );

      // Send notification if transitioning from draft
      if (
        event.visibility === "Draft" &&
        (update.visibility === "Publish" || update.visibility === "Schedule")
      ) {
        this.notificationService.sendEventNotification(updatedEvent);
      }

      return updatedEvent;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating event");
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
    },
    page: number = 1,
    pageSize: number = 10
  ) {
    return this.queryService.getEvents(
      societyId,
      filters,
      user,
      page,
      pageSize
    );
  }

  static async getEventById(eventId: string) {
    return EventRepository.findEventById(eventId);
  }

  static async registerForEvent(eventId: string, studentId: string) {
    return this.registrationService.registerForEvent(eventId, studentId);
  }

  static async completeRegistrationAfterPayment(registrationId: string) {
    return this.registrationService.completeRegistrationAfterPayment(
      registrationId
    );
  }

  static async cancelRegistration(
    registrationId: string,
    reason = "Student cancellation"
  ) {
    return this.registrationService.cancelRegistration(registrationId, reason);
  }

  static async getUserEventRegistrations(userId: string, eventIds: string[]) {
    return EventRepository.getUserEventRegistrations(userId, eventIds);
  }

  static async getUserRegisteredEvents(userId: string) {
    return EventRepository.getUserRegisteredEvents(userId);
  }

  static async deleteEvent(eventId: string) {
    return this.statusService.deleteEvent(eventId);
  }

  static async cancelEvent(eventId: string) {
    return this.statusService.cancelEvent(eventId);
  }

  static async scanTicket(ticketData: {
    registrationId: string;
    eventId: string;
    studentId: string;
    societyId: string;
    adminId: string;
  }) {
    return this.ticketService.scanTicket(ticketData);
  }

  static async inviteStudents(eventId: string, studentIds: string[]) {
    const event = await EventRepository.findEventById(eventId);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.visibility === "Draft") {
      throw new ApiError(400, "Cannot invite students to a draft event");
    }

    if (event.status === "Cancelled" || event.status === "Completed") {
      throw new ApiError(
        400,
        "Cannot invite students to a cancelled or completed event"
      );
    }

    const { newInvitations, newStudentIds } =
      await EventRepository.inviteStudents(eventId, studentIds);

    this.notificationService.sendEventInviteNotifications(newStudentIds, event);

    return newInvitations;
  }

  static async getUserInvitedEvents(userId: string) {
    return (await EventRepository.getUserInvitations(userId)).map(
      ({ event }) => event
    );
  }

  static async rejectInvitation(userId: string, eventId: string) {
    await EventRepository.rejectInvitation(eventId, userId);
  }

  static async getRegistrations(
    eventId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      eventId,
    };

    if (search && search.trim()) {
      where.OR = [
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { email: { contains: search, mode: "insensitive" } } },
        {
          student: {
            registrationNumber: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const { registrations, total } = await EventRepository.fetchRegistrations(
      where,
      skip,
      limit
    );

    return {
      registrations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  // Draft-related methods
  static async saveDraft(
    input: any,
    societyId: string,
    formStep: number,
    eventId?: string
  ) {
    return this.draftService.saveDraft(input, societyId, formStep, eventId);
  }

  static async getDraft(eventId: string, societyId: string) {
    return this.draftService.getDraft(eventId, societyId);
  }

  static async getDrafts(societyId: string) {
    return this.draftService.getDrafts(societyId);
  }
}
