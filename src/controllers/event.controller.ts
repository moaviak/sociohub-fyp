import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { getLocalPath } from "../utils/helpers";
import { EventService } from "../services/event.service";
import {
  EventCategories,
  EventType,
  EventAudience,
  EventVisibility,
  PaymentMethods,
} from "@prisma/client";

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
