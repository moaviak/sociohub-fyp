import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getLocalPath, isSocietyMember } from "../utils/helpers";
import { EventService } from "../services/event.service";
import {
  EventCategories,
  EventType,
  EventAudience,
  EventVisibility,
  Event,
  EventStatus,
} from "@prisma/client";
import {
  EventAnnouncementInput,
  EventAnnouncementService,
} from "../services/event-announcement.service";
import { haveEventsPrivilege } from "../utils/helpers";
import { IUser, UserType } from "../types";
import prisma from "../db";
import { EventRegistrationService } from "../services/event-registration.service";
import activityService from "../services/activity.service";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  // Get the local path for the uploaded banner if it exists
  const banner = req.file ? getLocalPath(req.file.filename) : undefined;

  // Parse arrays and JSON fields from form data
  const categories = req.body.categories
    ? (JSON.parse(req.body.categories) as EventCategories[])
    : [];

  // Convert string booleans to actual booleans
  const registrationRequired = req.body.registrationRequired === "true";
  const paidEvent = req.body.paidEvent === "true";
  const announcementEnabled = req.body.announcementEnabled === "true";

  // Create event using service
  const event = await EventService.createEvent({
    societyId: req.body.societyId,
    title: req.body.title,
    tagline: req.body.tagline,
    description: req.body.description,
    categories,
    banner,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    eventType: req.body.eventType as EventType,
    venueName: req.body.venueName,
    venueAddress: req.body.venueAddress,
    platform: req.body.platform,
    meetingLink: req.body.meetingLink,
    accessInstructions: req.body.accessInstructions,
    audience: req.body.audience as EventAudience,
    visibility: req.body.visibility as EventVisibility,
    publishDateTime: req.body.publishDateTime
      ? new Date(req.body.publishDateTime)
      : undefined,
    registrationRequired,
    registrationDeadline: req.body.registrationDeadline
      ? new Date(req.body.registrationDeadline)
      : undefined,
    maxParticipants: req.body.maxParticipants
      ? parseInt(req.body.maxParticipants, 10)
      : undefined,
    paidEvent,
    ticketPrice: req.body.ticketPrice
      ? parseInt(req.body.ticketPrice, 10)
      : undefined,
    announcementEnabled,
    announcement: req.body.announcement,
    isDraft: false,
    formStep: req.body.formStep ? parseInt(req.body.formStep, 10) : undefined,
  });

  if (user.userType === UserType.STUDENT) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId: event.societyId,
      action: "Create Event",
      description: `${user.firstName} ${user.lastName} created a new Event: ${event.title}`,
      nature: "CONSTRUCTIVE",
      targetId: event.id,
      targetType: "Event",
    });
  }

  return res.status(201).json({
    status: 201,
    message: "Event created successfully",
    data: event,
  });
});

export const saveDraft = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get the local path for the uploaded banner if it exists
    const banner = req.file ? getLocalPath(req.file.filename) : undefined;

    // Parse arrays and JSON fields from form data
    let categories: EventCategories[] = [];
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch (e) {
        // If parsing fails, leave categories as empty array
      }
    }

    // Get time strings if they exist
    const startTime = req.body.startTime || undefined;
    const endTime = req.body.endTime || undefined;

    // Helper to convert empty string to null or undefined for dates/numbers
    const nullIfEmpty = (val: any) => (val === "" ? null : val);
    const undefinedIfEmpty = (val: any) => (val === "" ? undefined : val);

    const draftData = {
      societyId: req.body.societyId,
      ...("title" in req.body && { title: nullIfEmpty(req.body.title) }),
      ...("tagline" in req.body && { tagline: nullIfEmpty(req.body.tagline) }),
      ...("description" in req.body && {
        description: nullIfEmpty(req.body.description),
      }),
      ...(categories.length > 0 && { categories }),
      ...(banner && { banner }),
      ...("startDate" in req.body && {
        startDate: undefinedIfEmpty(req.body.startDate)
          ? new Date(req.body.startDate)
          : undefined,
      }),
      ...("endDate" in req.body && {
        endDate: undefinedIfEmpty(req.body.endDate)
          ? new Date(req.body.endDate)
          : undefined,
      }),
      ...("startTime" in req.body && { startTime: nullIfEmpty(startTime) }),
      ...("endTime" in req.body && { endTime: nullIfEmpty(endTime) }),
      ...("eventType" in req.body && {
        eventType: nullIfEmpty(req.body.eventType),
      }),
      ...("venueName" in req.body && {
        venueName: nullIfEmpty(req.body.venueName),
      }),
      ...("venueAddress" in req.body && {
        venueAddress: nullIfEmpty(req.body.venueAddress),
      }),
      ...("platform" in req.body && {
        platform: nullIfEmpty(req.body.platform),
      }),
      ...("meetingLink" in req.body && {
        meetingLink: nullIfEmpty(req.body.meetingLink),
      }),
      ...("accessInstructions" in req.body && {
        accessInstructions: nullIfEmpty(req.body.accessInstructions),
      }),
      ...("audience" in req.body && {
        audience: nullIfEmpty(req.body.audience),
      }),
      ...("visibility" in req.body && {
        visibility: nullIfEmpty(req.body.visibility),
      }),
      ...("publishDateTime" in req.body && {
        publishDateTime: undefinedIfEmpty(req.body.publishDateTime)
          ? new Date(req.body.publishDateTime)
          : undefined,
      }),
      ...(typeof req.body.registrationRequired !== "undefined" && {
        registrationRequired: req.body.registrationRequired === "true",
      }),
      ...("registrationDeadline" in req.body && {
        registrationDeadline: undefinedIfEmpty(req.body.registrationDeadline)
          ? new Date(req.body.registrationDeadline)
          : undefined,
      }),
      ...("maxParticipants" in req.body && {
        maxParticipants: undefinedIfEmpty(req.body.maxParticipants)
          ? parseInt(req.body.maxParticipants, 10)
          : undefined,
      }),
      ...(typeof req.body.paidEvent !== "undefined" && {
        paidEvent: req.body.paidEvent === "true",
      }),
      ...("ticketPrice" in req.body && {
        ticketPrice: undefinedIfEmpty(req.body.ticketPrice)
          ? parseInt(req.body.ticketPrice, 10)
          : undefined,
      }),
      ...(typeof req.body.announcementEnabled !== "undefined" && {
        announcementEnabled: req.body.announcementEnabled === "true",
      }),
      ...("announcement" in req.body && {
        announcement: nullIfEmpty(req.body.announcement),
      }),
    };

    const draft = await EventService.saveDraft(
      draftData,
      req.body.societyId,
      parseInt(req.body.formStep),
      req.body.eventId
    );

    return res
      .status(200)
      .json(new ApiResponse(200, draft, "Draft saved successfully"));
  } catch (error: any) {
    throw new ApiError(500, "Error saving draft: " + error.message);
  }
});

export const getDraft = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.params.eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    if (!req.params.societyId) {
      throw new ApiError(400, "Society ID is required");
    }

    const draft = await EventService.getDraft(
      req.params.eventId,
      req.params.societyId
    );

    return res
      .status(200)
      .json(new ApiResponse(200, draft, "Draft retrieved successfully"));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error retrieving draft: " + error.message);
  }
});

export const getDrafts = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.params.societyId) {
      throw new ApiError(400, "Society ID is required");
    }

    const drafts = await EventService.getDrafts(req.params.societyId);

    return res
      .status(200)
      .json(new ApiResponse(200, drafts, "Drafts retrieved successfully"));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error retrieving drafts: " + error.message);
  }
});

export const generateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const eventInput: EventAnnouncementInput = req.body;

    const announcementService = new EventAnnouncementService();

    try {
      // Generate the announcement
      const announcement = await announcementService.generateAnnouncement(
        eventInput
      );

      // You can then use this announcement when creating your event
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            announcement,
            "Announcement generated successfully"
          )
        );
    } catch (error) {
      console.error("Error generating announcement:", error);
      new ApiError(500, "Error generating announcement");
    }
  }
);

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.user as IUser;

    // If societyId is not provided, fetch all events
    const societyId = req.query.societyId as string | undefined;

    // Get filters from query parameters
    const filters: {
      status?: "Upcoming" | "Past" | "Draft";
      categories?: EventCategories[];
      search?: string;
    } = {};

    // Parse status filter
    if (
      req.query.status &&
      ["Upcoming", "Past", "Draft"].includes(req.query.status as string)
    ) {
      filters.status = req.query.status as "Upcoming" | "Past" | "Draft";
    }

    // Parse categories filter
    if (req.query.categories) {
      filters.categories = (req.query.categories as string).split(
        ","
      ) as EventCategories[];
    }

    // Get search term
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    // Get user details
    const user = req.user as IUser;
    let userContext = undefined;
    if (societyId) {
      const hasPrivilege = await haveEventsPrivilege(user.id, societyId);
      const isMember =
        user.userType === UserType.ADVISOR ||
        (await isSocietyMember(user.id, societyId));
      userContext = {
        id: user.id,
        isMember,
        hasEventsPrivilege: hasPrivilege,
      };
    } else {
      // If no societyId, just pass user id
      userContext = { id: user.id, isMember: false, hasEventsPrivilege: false };
    }

    // Parse limit from query
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const events = await EventService.getEvents(
      societyId,
      filters,
      userContext,
      limit
    );

    // For each event, check if the user is registered
    const eventIds = events.map((e: any) => e.id);
    let registrations: { eventId: string }[] = [];
    if (eventIds.length > 0) {
      registrations = await EventService.getUserEventRegistrations(
        id,
        eventIds
      );
    }
    const registeredSet = new Set(registrations.map((r) => r.eventId));
    const eventsWithRegistration = events.map((event: any) => ({
      ...event,
      isRegistered: registeredSet.has(event.id),
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          eventsWithRegistration,
          "Events fetched successfully"
        )
      );
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error fetching events: " + error.message);
  }
});

export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        throw new ApiError(400, "Event ID is required");
      }
      const user = req.user as IUser;
      const event = await EventService.getEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }
      let isRegistered = false;
      let registration = undefined;
      if (user && user.id) {
        // Find registration for this user and event, including ticket and student info
        const reg = await prisma.eventRegistration.findFirst({
          where: { studentId: user.id, eventId },
          include: {
            ticket: true,
            student: true,
          },
        });
        if (reg) {
          isRegistered = true;
          registration = {
            id: reg.id,
            studentId: reg.studentId,
            eventId: reg.eventId,
            registeredAt: reg.registeredAt,
            ticket: reg.ticket,
            student: reg.student,
          };
        }
      }
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            ...event,
            isRegistered,
            ...(registration ? { registration } : {}),
          },
          "Event retrieved successfully"
        )
      );
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error retrieving event: " + error.message);
    }
  }
);

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const eventId = req.body.eventId || req.params.eventId;
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }

    // Get the local path for the uploaded banner if it exists
    const banner = req.file ? getLocalPath(req.file.filename) : null;

    // Parse arrays and JSON fields from form data
    let categories;
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch (e) {
        // If parsing fails, leave as is
      }
    }

    // Helper to convert empty string to null or undefined for dates/numbers
    const nullIfEmpty = (val: any) => (val === "" ? null : val);
    const undefinedIfEmpty = (val: any) => (val === "" ? undefined : val);

    // Convert string booleans to actual booleans
    const registrationRequired =
      req.body.registrationRequired === "true"
        ? true
        : req.body.registrationRequired === "false"
        ? false
        : undefined;
    const paidEvent =
      req.body.paidEvent === "true"
        ? true
        : req.body.paidEvent === "false"
        ? false
        : undefined;
    const announcementEnabled =
      req.body.announcementEnabled === "true"
        ? true
        : req.body.announcementEnabled === "false"
        ? false
        : undefined;

    const updateData = {
      ...("title" in req.body && { title: nullIfEmpty(req.body.title) }),
      ...("tagline" in req.body && { tagline: nullIfEmpty(req.body.tagline) }),
      ...("description" in req.body && {
        description: nullIfEmpty(req.body.description),
      }),
      ...(categories && { categories }),
      ...(banner && { banner }),
      ...("startDate" in req.body && {
        startDate: undefinedIfEmpty(req.body.startDate)
          ? new Date(req.body.startDate)
          : undefined,
      }),
      ...("endDate" in req.body && {
        endDate: undefinedIfEmpty(req.body.endDate)
          ? new Date(req.body.endDate)
          : undefined,
      }),
      ...("startTime" in req.body && {
        startTime: nullIfEmpty(req.body.startTime),
      }),
      ...("endTime" in req.body && { endTime: nullIfEmpty(req.body.endTime) }),
      ...("eventType" in req.body && {
        eventType: nullIfEmpty(req.body.eventType),
      }),
      ...("venueName" in req.body && {
        venueName: nullIfEmpty(req.body.venueName),
      }),
      ...("venueAddress" in req.body && {
        venueAddress: nullIfEmpty(req.body.venueAddress),
      }),
      ...("platform" in req.body && {
        platform: nullIfEmpty(req.body.platform),
      }),
      ...("meetingLink" in req.body && {
        meetingLink: nullIfEmpty(req.body.meetingLink),
      }),
      ...("accessInstructions" in req.body && {
        accessInstructions: nullIfEmpty(req.body.accessInstructions),
      }),
      ...("audience" in req.body && {
        audience: nullIfEmpty(req.body.audience),
      }),
      ...("visibility" in req.body && {
        visibility: nullIfEmpty(req.body.visibility),
      }),
      ...("publishDateTime" in req.body && {
        publishDateTime: undefinedIfEmpty(req.body.publishDateTime)
          ? new Date(req.body.publishDateTime)
          : undefined,
      }),
      ...(typeof registrationRequired !== "undefined" && {
        registrationRequired,
      }),
      ...("registrationDeadline" in req.body && {
        registrationDeadline: undefinedIfEmpty(req.body.registrationDeadline)
          ? new Date(req.body.registrationDeadline)
          : undefined,
      }),
      ...("maxParticipants" in req.body && {
        maxParticipants: undefinedIfEmpty(req.body.maxParticipants)
          ? parseInt(req.body.maxParticipants, 10)
          : undefined,
      }),
      ...(typeof paidEvent !== "undefined" && { paidEvent }),
      ...("ticketPrice" in req.body && {
        ticketPrice: undefinedIfEmpty(req.body.ticketPrice)
          ? parseInt(req.body.ticketPrice, 10)
          : undefined,
      }),
      ...(typeof announcementEnabled !== "undefined" && {
        announcementEnabled,
      }),
      ...("announcement" in req.body && {
        announcement: nullIfEmpty(req.body.announcement),
      }),
      isDraft: false,
      ...("formStep" in req.body && {
        formStep: undefinedIfEmpty(req.body.formStep)
          ? parseInt(req.body.formStep, 10)
          : undefined,
      }),
    };

    const updatedEvent = await EventService.updateEvent(eventId, updateData);

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: updatedEvent.societyId,
        action: "Create Event",
        description: `${user.firstName} ${user.lastName} updated an Event: ${updatedEvent.title}`,
        nature: "NEUTRAL",
        targetId: updatedEvent.id,
        targetType: "Event",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error updating event: " + error.message);
  }
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const user = req.user as IUser;
  const { eventId } = req.body;

  if (!eventId) throw new ApiError(400, "Event ID is required");

  if (user.userType === UserType.ADVISOR) {
    throw new ApiError(403, "Advisor can't register in an event.");
  }

  const result = await new EventRegistrationService().registerForEvent(
    eventId,
    user.id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Registration successful"));
});

export const completeRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { registrationId } = req.params;

    const result = await EventService.completeRegistrationAfterPayment(
      registrationId
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Registration successfully completed")
      );
  }
);

export const cancelRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { registrationId } = req.params;
    const { reason } = req.body;

    const result = await EventService.cancelRegistration(
      registrationId,
      reason
    );

    res.status(200).json(new ApiResponse(200, null, "Registration cancelled."));
  }
);

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { eventId } = req.params;
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    const deletedEvent = await EventService.deleteEvent(eventId);

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: deletedEvent.societyId,
        action: "Delete Event",
        description: `${user.firstName} ${user.lastName} deleted an Event: ${deletedEvent.title}`,
        nature: "CONSTRUCTIVE",
        targetId: deletedEvent.id,
        targetType: "Event",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedEvent, "Event deleted successfully"));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error deleting event: " + error.message);
  }
});

export const cancelEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { eventId } = req.params;
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    const cancelledEvent = await EventService.cancelEvent(eventId);

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId: cancelledEvent.societyId,
        action: "Cancel Event",
        description: `${user.firstName} ${user.lastName} cancelled an Event: ${cancelledEvent.title}`,
        nature: "ADMINISTRATIVE",
        targetId: cancelledEvent.id,
        targetType: "Event",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, cancelledEvent, "Event cancelled successfully")
      );
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error cancelling event: " + error.message);
  }
});

/**
 * Get all events the user is registered for, including ticket info
 */
export const getUserRegisteredEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (!user || !user.id) {
      throw new ApiError(401, "Unauthorized");
    }
    const events = await EventService.getUserRegisteredEvents(user.id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          events,
          "User registered events fetched successfully"
        )
      );
  }
);

/**
 * Scan and validate an event ticket (admin only)
 */
export const scanTicket = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.user as IUser;
  const { registrationId, eventId, studentId, societyId } = req.body;

  const ticket = await EventService.scanTicket({
    registrationId,
    eventId,
    studentId,
    societyId,
    adminId: admin.id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket scanned successfully"));
});

/**
 * Invite students to an event
 */
export const inviteStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, studentIds } = req.body;

    const invitations = await EventService.inviteStudents(eventId, studentIds);

    return res
      .status(200)
      .json(new ApiResponse(200, invitations, "Invitations sent successfully"));
  }
);

/**
 * Get events the user is invited to
 */
export const getUserInvitedEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Events successfully fetched"));
  }
);
