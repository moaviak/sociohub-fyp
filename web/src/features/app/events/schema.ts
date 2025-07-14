import { z } from "zod";

// Define event categories as an enum for type safety
export const EventCategories = z.enum([
  "Workshop",
  "Seminar",
  "Social Gathering",
  "Competition",
  "Cultural Event",
  "Sports Event",
  "Meeting",
  "Other",
]);

// Define event types as an enum
export const EventType = z.enum(["Physical", "Online"]);

// Define audience types as an enum
const AudienceType = z.enum(["Open", "Members", "Invite"]);

// Define visibility options as an enum
const VisibilityType = z.enum(["Publish", "Draft", "Schedule"]);

// Define online platforms as an enum
const OnlinePlatform = z.enum([
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Other",
]);

// Section 1: Basic Event Information Schema
const basicInfoSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventTagline: z
    .string()
    .max(150, "Tagline must be 150 characters or less")
    .optional(),
  detailedDescription: z.string().optional(),
  eventCategories: z
    .array(EventCategories)
    .min(1, "Please select at least one category"),
  eventImage: z.instanceof(File).optional(), // You might want to add file type/size validation here
});

// Section 2: Date & Time Schema
// Removed the refine here, will move to main schema
const dateTimeSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endDate: z.date({
    required_error: "End date is required",
  }),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

// Section 3: Location Schema (without conditional fields)
export const locationSchema = z.object({
  eventType: EventType.default("Physical"),
  // Physical location fields
  venueName: z.string().optional(),
  address: z.string().optional(),
  // Online event fields
  platform: OnlinePlatform.optional(),
  otherPlatform: z.string().optional(),
  meetingLink: z.string().url("Please enter a valid URL").optional(),
  accessInstructions: z.string().optional(),
});
// Removed superRefine here

// Section 4: Audience & Visibility Schema
export const audienceSchema = z.object({
  audience: AudienceType.default("Open"),
});

// Simplified visibility schemas, validation moved to main schema
const scheduledPublishSchema = z.object({
  visibility: z.literal("Schedule"),
  publishDateTime: z.date().optional(), // Make optional here, validate in main schema
});

const otherVisibilitySchema = z.object({
  visibility: z.enum(["Publish", "Draft"]),
});

export const visibilitySchema = z.discriminatedUnion("visibility", [
  scheduledPublishSchema,
  otherVisibilitySchema,
]);

// Section 5: Registration Schema (without conditional validation)
export const registrationSchema = z.object({
  isRegistrationRequired: z.boolean().default(false),
  registrationDeadline: z.date().optional(),
  maximumParticipants: z.number().int().positive().optional(),
  isPaidEvent: z.boolean().optional().default(false),
  ticketPrice: z.number().positive().optional(),
});
// Removed refine here

// Section 6: Announcement Schema (without conditional validation)
const announcementEnabledSchema = z.object({
  isAnnouncementEnabled: z.literal(true),
  announcement: z.string().optional(), // Make optional here, validate in main schema
});

const noAnnouncementSchema = z.object({
  isAnnouncementEnabled: z.literal(false),
  announcement: z.string().optional(),
});

export const announcementSchema = z.discriminatedUnion(
  "isAnnouncementEnabled",
  [announcementEnabledSchema, noAnnouncementSchema]
);

// Complete Event Form Schema
export const eventFormSchema = z
  .object({
    // Basic info fields
    eventTitle: basicInfoSchema.shape.eventTitle,
    eventTagline: basicInfoSchema.shape.eventTagline,
    detailedDescription: basicInfoSchema.shape.detailedDescription,
    eventCategories: basicInfoSchema.shape.eventCategories,
    eventImage: basicInfoSchema.shape.eventImage,

    // Date & time fields
    startDate: dateTimeSchema.shape.startDate,
    startTime: dateTimeSchema.shape.startTime,
    endDate: dateTimeSchema.shape.endDate,
    endTime: dateTimeSchema.shape.endTime,

    // Location fields
    eventType: EventType,
    venueName: locationSchema.shape.venueName,
    address: locationSchema.shape.address,
    platform: locationSchema.shape.platform,
    otherPlatform: locationSchema.shape.otherPlatform,
    meetingLink: locationSchema.shape.meetingLink,
    accessInstructions: locationSchema.shape.accessInstructions,

    // Audience & visibility fields
    audience: AudienceType,
    visibility: VisibilityType,
    publishDateTime: z.date().optional(), // Keep optional here, validate in refine

    // Registration fields (flat structure)
    isRegistrationRequired: z.boolean(),
    registrationDeadline: z.date().optional(),
    maximumParticipants: z.number().int().positive().optional(),
    isPaidEvent: z.boolean().optional(),
    ticketPrice: z.number().positive().optional(),

    // Announcement fields (flat structure)
    isAnnouncementEnabled: z.boolean(),
    announcement: z.string().optional(), // Keep optional here, validate in refine

    // Additional fields
    isDraft: z.boolean().default(false),
    formStep: z.number().int().min(1).max(6).default(1),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .superRefine(
    // Combined date/time validation - Apply from step 2
    (data, ctx) => {
      // Changed to superRefine with context
      if (data.formStep < 2) return; // Skip validation before step 2

      if (
        !data.startDate ||
        !data.startTime ||
        !data.endDate ||
        !data.endTime
      ) {
        return; // Individual field validations should catch missing required fields
      }
      const startDateTime = new Date(data.startDate);
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(data.endDate);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        // Handle invalid date construction if necessary, though individual date/time validations should cover this
        return;
      }

      if (endDateTime <= startDateTime) {
        ctx.addIssue({
          // Add issue for endDate
          code: z.ZodIssueCode.custom,
          message: "End date/time must be after start date/time",
          path: ["endDate"],
        });
        ctx.addIssue({
          // Add issue for endTime
          code: z.ZodIssueCode.custom,
          message: "End date/time must be after start date/time",
          path: ["endTime"],
        });
      }
    }
  )
  .refine(
    // Validate eventType-specific fields - Apply from step 3
    (data) => {
      if (data.formStep < 3) return true; // Skip validation before step 3

      if (data.eventType === "Physical") {
        return !!data.venueName && data.venueName.trim() !== "";
      } else if (data.eventType === "Online") {
        const isPlatformValid = !!data.platform;
        const isMeetingLinkValid =
          !!data.meetingLink && data.meetingLink.trim() !== "";
        return isPlatformValid && isMeetingLinkValid;
      }
      return true; // Should be unreachable
    },
    {
      message:
        "Please complete all required fields for the selected event type.",
      path: ["venueName"], // Point to venueName or platform depending on event type? Let's keep venueName for now as it was the original issue.
    }
  )
  .refine(
    // Validate other platform when "Other" is selected - Apply from step 3
    (data) => {
      if (data.formStep < 3) return true; // Skip validation before step 3

      if (data.platform === "Other") {
        return !!data.otherPlatform && data.otherPlatform.trim() !== "";
      }
      return true;
    },
    {
      message: "Please specify the platform name when 'Other' is selected.",
      path: ["otherPlatform"],
    }
  )
  .refine(
    // Validate visibility-specific fields - Apply from step 4
    (data) => {
      if (data.formStep < 4) return true; // Skip validation before step 4

      if (data.visibility === "Schedule") {
        return !!data.publishDateTime;
      }
      return true;
    },
    {
      message:
        "Please provide a publish date and time for scheduled publishing.",
      path: ["publishDateTime"],
    }
  )
  .refine(
    // Validate scheduled publish date is not in the past - Apply from step 4
    (data) => {
      if (data.formStep < 4) return true; // Skip validation before step 4

      if (data.visibility === "Schedule" && data.publishDateTime) {
        const now = new Date();
        // Consider if time should also be checked, or just date
        // Based on the message "Scheduled publish date and time cannot be in the past.", let's check date and time.
        return data.publishDateTime.getTime() >= now.getTime();
      }
      return true;
    },
    {
      message: "Scheduled publish date and time cannot be in the past.",
      path: ["publishDateTime"],
    }
  )
  .refine(
    // Validate registration fields - Apply from step 5
    (data) => {
      if (data.formStep < 5) return true; // Skip validation before step 5

      if (data.isRegistrationRequired) {
        return !!data.registrationDeadline;
      }
      return true;
    },
    {
      message:
        "Registration deadline is required when registration is enabled.",
      path: ["registrationDeadline"],
    }
  )
  .superRefine(
    // Validate paid event fields - Apply from step 5
    (data, ctx) => {
      if (data.formStep < 5) return; // Skip validation before step 5

      if (data.isRegistrationRequired && data.isPaidEvent === true) {
        const hasPrice = !!data.ticketPrice && data.ticketPrice > 0;

        if (!hasPrice) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ticket price is required for paid events.",
            path: ["ticketPrice"],
          });
        }
      }
    }
  )
  .refine(
    // Ensure no payment info for free (but registration required) events - Apply from step 5
    (data) => {
      if (data.formStep < 5) return true; // Skip validation before step 5

      if (data.isRegistrationRequired && data.isPaidEvent === false) {
        if (data.ticketPrice !== undefined && data.ticketPrice !== null)
          return false; // Should not have price
      }
      return true;
    },
    {
      message:
        "Ticket price or payment gateways should not be set for free events.",
      path: ["isPaidEvent"], // General path indicating this conflict
    }
  )
  .refine(
    // Validate announcement fields - Apply from step 6
    (data) => {
      if (data.formStep < 6) return true; // Skip validation before step 6

      if (data.isAnnouncementEnabled) {
        return !!data.announcement && data.announcement.trim() !== "";
      }
      return true;
    },
    {
      message: "Announcement text is required when announcements are enabled.",
      path: ["announcement"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.formStep < 2) return; // Only validate from step 2 onward

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (data.startDate && data.startDate < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date cannot be in the past.",
        path: ["startDate"],
      });
    }
    if (data.endDate && data.endDate < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be in the past.",
        path: ["endDate"],
      });
    }
  });

// Create a type from the schema
export type EventFormData = z.infer<typeof eventFormSchema>;

// Create partial schema for handling drafts - Keep these as they are for draft saving
export const basicInfoSchemaPartial = z.object({
  eventTitle: basicInfoSchema.shape.eventTitle.optional(),
  eventTagline: basicInfoSchema.shape.eventTagline.optional(),
  detailedDescription: basicInfoSchema.shape.detailedDescription.optional(),
  eventCategories: basicInfoSchema.shape.eventCategories.optional(),
  eventImage: basicInfoSchema.shape.eventImage.optional(),
});

export const dateTimeSchemaPartial = z.object({
  startDate: dateTimeSchema.shape.startDate.optional(),
  startTime: dateTimeSchema.shape.startTime.optional(),
  endDate: dateTimeSchema.shape.endDate.optional(),
  endTime: dateTimeSchema.shape.endTime.optional(),
});

export const locationSchemaPartial = z.object({
  eventType: EventType.optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  platform: OnlinePlatform.optional(),
  otherPlatform: z.string().optional(),
  meetingLink: z.string().url().optional(),
  accessInstructions: z.string().optional(),
});

export const audienceVisibilitySchemaPartial = z.object({
  audience: AudienceType.optional(),
  visibility: VisibilityType.optional(),
  publishDateTime: z.date().optional(),
});

export const registrationSchemaPartial = z.object({
  isRegistrationRequired: z.boolean().optional(),
  registrationDeadline: z.date().optional(),
  maximumParticipants: z.number().int().positive().optional(),
  isPaidEvent: z.boolean().optional(),
  ticketPrice: z.number().positive().optional(),
});

export const announcementSchemaPartial = z.object({
  isAnnouncementEnabled: z.boolean().optional(),
  announcement: z.string().optional(),
});

// Schema for handling drafts with partial validation
export const draftEventFormSchema = z.object({
  ...basicInfoSchemaPartial.shape,
  ...dateTimeSchemaPartial.shape,
  ...locationSchemaPartial.shape,
  ...audienceVisibilitySchemaPartial.shape,
  ...registrationSchemaPartial.shape,
  ...announcementSchemaPartial.shape,

  // These fields are required even for drafts (or have defaults)
  isDraft: z.literal(true),
  formStep: z.number().int().min(1).max(6),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type DraftEventFormData = z.infer<typeof draftEventFormSchema>;
