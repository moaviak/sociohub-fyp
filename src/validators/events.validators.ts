import { body, check } from "express-validator";

export const createEventValidator = () => [
  body("societyId").notEmpty().withMessage("Society ID is required"),

  // Section 1: Basic Event Information
  body("title").notEmpty().withMessage("Event title is required"),
  body("tagline")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Tagline must be a string")
    .isLength({ max: 150 })
    .withMessage("Tagline must be 150 characters or less"),
  body("description")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Detailed description must be a string"),
  body("categories")
    .custom((value, { req }) => {
      if (typeof value === "string") {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue) && parsedValue.length > 0) {
            req.body.categories = parsedValue;
            return true;
          } else {
            throw new Error("Event categories must be a non-empty array");
          }
        } catch (e: any) {
          throw new Error(
            e.message || "Event categories must be a valid JSON array"
          );
        }
      }
      // If not a string, let express-validator's default handling take over (should fail isArray if not an array)
      return Array.isArray(value) && value.length > 0;
    })
    .withMessage("Event categories must be a non-empty array"),
  // Note: File validation is typically handled by middleware like Multer, not express-validator body checks.
  // body('eventImage').optional(), // Placeholder, actual file validation needed elsewhere

  // Section 2: Date & Time
  body("startDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .toDate()
    .withMessage("Start date is required and must be in YYYY-MM-DD format"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
  body("endDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .toDate()
    .withMessage("End date is required and must be in YYYY-MM-DD format"),
  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),

  // Combined date/time validation (requires custom logic or later middleware)
  // check('endDate', 'End date/time must be after start date/time').custom((value, { req }) => {
  //   const startDate = new Date(req.body.startDate);
  //   const [startHours, startMinutes] = req.body.startTime.split(':').map(Number);
  //   startDate.setHours(startHours, startMinutes, 0, 0);

  //   const endDate = new Date(value);
  //   const [endHours, endMinutes] = req.body.endTime.split(':').map(Number);
  //   endDate.setHours(endHours, endMinutes, 0, 0);

  //   return endDate > startDate;
  // }),

  // Section 3: Location
  body("eventType")
    .isIn(["Physical", "Online"])
    .withMessage("Invalid event type"),
  body("venueName")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Venue name must be a string"),
  body("venueAddress")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Address must be a string"),
  body("platform")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return ["Zoom", "Google Meet", "Microsoft Teams", "Other"].includes(
        value
      );
    })
    .withMessage("Invalid online platform"),
  body("otherPlatform")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Other platform must be a string"),
  body("meetingLink")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage("Please enter a valid URL"),
  body("accessInstructions")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return typeof value === "string";
    })
    .withMessage("Access instructions must be a string"),

  // Conditional validation for location (requires custom logic or later middleware)
  // check('venueName', 'Venue name is required for Physical events').custom((value, { req }) => {
  //   if (req.body.eventType === 'Physical') {
  //     return !!value && value.trim() !== '';
  //   }
  //   return true;
  // }),
  // check('platform', 'Platform and Meeting Link are required for Online events').custom((value, { req }) => {
  //   if (req.body.eventType === 'Online') {
  //     return !!value && !!req.body.meetingLink && req.body.meetingLink.trim() !== '';
  //   }
  //   return true;
  // }),
  // check('otherPlatform', 'Please specify the platform name when "Other" is selected.').custom((value, { req }) => {
  //   if (req.body.platform === 'Other') {
  //     return !!value && value.trim() !== '';
  //   }
  //   return true;
  // }),

  // Section 4: Audience & Visibility
  body("audience")
    .isIn(["Open", "Members", "Invite"])
    .withMessage("Invalid audience type"),
  body("visibility")
    .isIn(["Publish", "Draft", "Schedule"])
    .withMessage("Invalid visibility type"),
  body("publishDateTime")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Publish date and time must be a valid date"),

  // Conditional validation for visibility (requires custom logic or later middleware)
  // check('publishDateTime', 'Please provide a publish date and time for scheduled publishing.').custom((value, { req }) => {
  //   if (req.body.visibility === 'Schedule') {
  //     return !!value;
  //   }
  //   return true;
  // }),
  // check('publishDateTime', 'Scheduled publish date and time cannot be in the past.').custom((value, { req }) => {
  //   if (req.body.visibility === 'Schedule' && value) {
  //     return new Date(value).getTime() >= new Date().getTime();
  //   }
  //   return true;
  // }),

  // Section 5: Registration
  body("registrationRequired")
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.registrationRequired = true;
        } else if (value === "false") {
          req.body.registrationRequired = false;
        }
      }
      return true; // Let isBoolean handle non-string or other string values
    })
    .isBoolean()
    .withMessage("registrationRequired must be a boolean"),
  body("registrationDeadline")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage("Registration deadline must be a valid date"),
  body("maxParticipants")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    })
    .withMessage("Maximum participants must be a positive integer"),
  body("paidEvent")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      if (typeof value === "string") {
        return value === "true" || value === "false";
      }
      return typeof value === "boolean";
    })
    .withMessage("isPaidEvent must be a boolean"),
  body("ticketPrice")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      if (typeof value === "string") {
        const num = parseInt(value, 10);
        return !isNaN(num) && num > 0;
      }
      return typeof value === "number" && value > 0;
    })
    .withMessage("Ticket price must be a positive integer"),
  body("paymentMethods")
    .custom((value, { req }) => {
      // If the field is not present or is empty string, skip validation
      if (value === undefined || value === null || value === "") {
        req.body.paymentMethods = []; // Set empty array as default value
        return true;
      }

      if (typeof value === "string") {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            req.body.paymentMethods = parsedValue;
            return true;
          }
        } catch (e) {
          // Invalid JSON string
        }
        return false;
      }

      // If it's already an array, keep it as is
      if (Array.isArray(value)) {
        return true;
      }

      return false;
    })
    .withMessage("Payment methods must be an array"),
  // Note: Further validation of paymentGateways array elements can be added if needed.

  // Conditional validation for registration/paid event (requires custom logic or later middleware)
  // check('registrationDeadline', 'Registration deadline is required when registration is enabled.').custom((value, { req }) => {
  //   if (req.body.isRegistrationRequired) {
  //     return !!value;
  //   }
  //   return true;
  // }),
  // check(['ticketPrice', 'paymentGateways'], 'Ticket price and at least one payment gateway are required for paid events.').custom((value, { req }) => {
  //   if (req.body.isRegistrationRequired && req.body.isPaidEvent === true) {
  //     const hasPrice = !!req.body.ticketPrice && req.body.ticketPrice > 0;
  //     const hasGateways = !!req.body.paymentGateways && req.body.paymentGateways.length > 0;
  //     return hasPrice && hasGateways;
  //   }
  //   return true;
  // }),
  // check('isPaidEvent', 'Ticket price or payment gateways should not be set for free events.').custom((value, { req }) => {
  //   if (req.body.isRegistrationRequired && value === false) {
  //     if (req.body.ticketPrice !== undefined && req.body.ticketPrice !== null) return false;
  //     if (req.body.paymentGateways !== undefined && req.body.paymentGateways !== null && req.body.paymentGateways.length > 0) return false;
  //   }
  //   return true;
  // }),

  // Section 6: Announcement
  body("announcementEnabled")
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.announcementEnabled = true;
        } else if (value === "false") {
          req.body.announcementEnabled = false;
        }
      }
      return true; // Let isBoolean handle non-string or other string values
    })
    .isBoolean()
    .withMessage("isAnnouncementEnabled must be a boolean"),
  body("announcement")
    .optional()
    .isString()
    .withMessage("Announcement must be a string"),

  // Conditional validation for announcement (requires custom logic or later middleware)
  // check('announcement', 'Announcement text is required when announcements are enabled.').custom((value, { req }) => {
  //   if (req.body.isAnnouncementEnabled) {
  //     return !!value && value.trim() !== '';
  //   }
  //   return true;
  // }),

  // Additional fields
  body("isDraft")
    .optional() // Optional as it has a default in Zod, but good to validate if provided
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.isDraft = true;
        } else if (value === "false") {
          req.body.isDraft = false;
        }
      }
      return true; // Let isBoolean handle non-string or other string values
    })
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  body("formStep")
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage("Form step must be an integer between 1 and 6"),
  // createdAt and updatedAt are typically set on the backend, not validated from the body.
  // body('createdAt').optional().isISO8601().toDate(),
  // body('updatedAt').optional().isISO8601().toDate(),
];

// Note: The complex conditional validations using Zod's .refine are commented out
// in the express-validator array. These validations are stateful (dependent on formStep)
// and involve cross-field logic that is best handled either:
// 1. In custom express-validator middleware after the basic checks.
// 2. By applying the Zod schema validation itself after parsing the request body.
// The provided array covers the basic type and presence checks.
