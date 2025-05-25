import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getLocalPath, isSocietyMember } from "../utils/helpers";
import { EventService } from "../services/event.service";
import type { DraftEventInput } from "../services/event.service";
import {
  EventCategories,
  EventType,
  EventAudience,
  EventVisibility,
  PaymentMethods,
  Event,
  EventStatus,
} from "@prisma/client";
import {
  EventAnnouncementInput,
  EventAnnouncementService,
} from "../services/event-announcement.service";
import { haveEventsPrivilege } from "../utils/helpers";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  // Get the local path for the uploaded banner if it exists
  const banner = req.file ? getLocalPath(req.file.filename) : undefined;

  // Parse arrays and JSON fields from form data
  const categories = req.body.categories
    ? (JSON.parse(req.body.categories) as EventCategories[])
    : [];
  const paymentMethods = req.body.paymentMethods
    ? (JSON.parse(req.body.paymentMethods) as PaymentMethods[])
    : undefined;

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
    paymentMethods,
    announcementEnabled,
    announcement: req.body.announcement,
    isDraft: false,
    formStep: req.body.formStep ? parseInt(req.body.formStep, 10) : undefined,
  });
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

    let paymentMethods: PaymentMethods[] | undefined;
    if (req.body.paymentMethods) {
      try {
        paymentMethods = JSON.parse(req.body.paymentMethods);
      } catch (e) {
        // If parsing fails, leave paymentMethods as undefined
      }
    }
    // Get time strings if they exist
    const startTime = req.body.startTime || undefined;
    const endTime = req.body.endTime || undefined;

    // Helper to convert empty string to null or undefined for dates/numbers
    const nullIfEmpty = (val: any) => (val === "" ? null : val);
    const undefinedIfEmpty = (val: any) => (val === "" ? undefined : val);

    const draftData: DraftEventInput = {
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
      ...(paymentMethods && paymentMethods.length > 0 && { paymentMethods }),
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
    const user = req.user as { id: string };
    let userContext = undefined;
    if (societyId) {
      const hasPrivilege = await haveEventsPrivilege(user.id, societyId);
      const isMember = await isSocietyMember(user.id, societyId);
      userContext = {
        id: user.id,
        isMember,
        hasEventsPrivilege: hasPrivilege,
      };
    } else {
      // If no societyId, just pass user id
      userContext = { id: user.id, isMember: false, hasEventsPrivilege: false };
    }

    const events = await EventService.getEvents(
      societyId,
      filters,
      userContext
    );

    return res
      .status(200)
      .json(new ApiResponse(200, events, "Events fetched successfully"));
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
      const event = await EventService.getEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, event, "Event retrieved successfully"));
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error retrieving event: " + error.message);
    }
  }
);

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
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
    let paymentMethods;
    if (req.body.paymentMethods) {
      try {
        paymentMethods = JSON.parse(req.body.paymentMethods);
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
      ...(paymentMethods && { paymentMethods }),
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
    return res
      .status(200)
      .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error updating event: " + error.message);
  }
});
