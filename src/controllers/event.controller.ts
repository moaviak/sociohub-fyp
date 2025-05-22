import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getLocalPath } from "../utils/helpers";
import { EventService } from "../services/event.service";
import type { DraftEventInput } from "../services/event.service";
import {
  EventCategories,
  EventType,
  EventAudience,
  EventVisibility,
  PaymentMethods,
  Event,
} from "@prisma/client";
import {
  EventAnnouncementInput,
  EventAnnouncementService,
} from "../services/event-announcement.service";

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
  const isDraft = req.body.isDraft === "true";

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
    startTime: new Date(`1970-01-01T${req.body.startTime}`),
    endTime: new Date(`1970-01-01T${req.body.endTime}`),
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
    isDraft,
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

    // Convert time strings to Date objects if they exist
    const startTime = req.body.startTime
      ? new Date(`1970-01-01T${req.body.startTime}`)
      : undefined;
    const endTime = req.body.endTime
      ? new Date(`1970-01-01T${req.body.endTime}`)
      : undefined;
    const draftData: DraftEventInput = {
      societyId: req.body.societyId,
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.tagline && { tagline: req.body.tagline }),
      ...(req.body.description && { description: req.body.description }),
      ...(categories.length > 0 && { categories }),
      ...(banner && { banner }),
      ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
      ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(req.body.eventType && { eventType: req.body.eventType as EventType }),
      ...(req.body.venueName && { venueName: req.body.venueName }),
      ...(req.body.venueAddress && { venueAddress: req.body.venueAddress }),
      ...(req.body.platform && { platform: req.body.platform }),
      ...(req.body.meetingLink && { meetingLink: req.body.meetingLink }),
      ...(req.body.accessInstructions && {
        accessInstructions: req.body.accessInstructions,
      }),
      ...(req.body.audience && {
        audience: req.body.audience as EventAudience,
      }),
      ...(req.body.visibility && {
        visibility: req.body.visibility as EventVisibility,
      }),
      ...(req.body.publishDateTime && {
        publishDateTime: new Date(req.body.publishDateTime),
      }),
      ...(typeof req.body.registrationRequired !== "undefined" && {
        registrationRequired: req.body.registrationRequired === "true",
      }),
      ...(req.body.registrationDeadline && {
        registrationDeadline: new Date(req.body.registrationDeadline),
      }),
      ...(req.body.maxParticipants && {
        maxParticipants: parseInt(req.body.maxParticipants, 10),
      }),
      ...(typeof req.body.paidEvent !== "undefined" && {
        paidEvent: req.body.paidEvent === "true",
      }),
      ...(req.body.ticketPrice && {
        ticketPrice: parseInt(req.body.ticketPrice, 10),
      }),
      ...(paymentMethods && paymentMethods.length > 0 && { paymentMethods }),
      ...(typeof req.body.announcementEnabled !== "undefined" && {
        announcementEnabled: req.body.announcementEnabled === "true",
      }),
      ...(req.body.announcement && { announcement: req.body.announcement }),
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
      console.log("Generated Announcement:");
      console.log(announcement);

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
