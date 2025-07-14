import { body, check } from "express-validator";

export const createEventValidator = () => [
  body("societyId").notEmpty().withMessage("Society ID is required"),

  // Section 1: Basic Event Information
  body("title").notEmpty().withMessage("Event title is required"),
  body("tagline")
    .optional()
    .isString()
    .withMessage("Tagline must be a string")
    .isLength({ max: 150 })
    .withMessage("Tagline must be 150 characters or less"),
  body("description")
    .optional()
    .isString()
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
      return Array.isArray(value) && value.length > 0;
    })
    .withMessage("Event categories must be a non-empty array"),

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

  // Section 3: Location
  body("eventType")
    .isIn(["Physical", "Online"])
    .withMessage("Invalid event type"),
  body("venueName")
    .optional()
    .isString()
    .withMessage("Venue name must be a string"),
  body("venueAddress")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  body("platform")
    .optional()
    .isIn(["Zoom", "Google Meet", "Microsoft Teams", "Other"])
    .withMessage("Invalid online platform"),
  body("otherPlatform")
    .optional()
    .isString()
    .withMessage("Other platform must be a string"),
  body("meetingLink")
    .optional()
    .custom((value) => {
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
    .isString()
    .withMessage("Access instructions must be a string"),

  // Section 4: Audience & Visibility
  body("audience")
    .isIn(["Open", "Members", "Invite"])
    .withMessage("Invalid audience type"),
  body("visibility")
    .isIn(["Publish", "Draft", "Schedule"])
    .withMessage("Invalid visibility type"),
  body("registrationDeadline")
    .optional()
    .custom((value) => {
      return !isNaN(Date.parse(value));
    })
    .withMessage("Registration deadline must be a valid date"),

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
      return true;
    })
    .isBoolean()
    .withMessage("registrationRequired must be a boolean"),
  body("registrationDeadline")
    .optional()
    .custom((value) => {
      return !isNaN(Date.parse(value));
    })
    .withMessage("Registration deadline must be a valid date"),
  body("maxParticipants")
    .optional()
    .custom((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    })
    .withMessage("Maximum participants must be a positive integer"),
  body("paidEvent")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        return value === "true" || value === "false";
      }
      return typeof value === "boolean";
    })
    .withMessage("isPaidEvent must be a boolean"),
  body("ticketPrice")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        const num = parseInt(value, 10);
        return !isNaN(num) && num > 0;
      }
      return typeof value === "number" && value > 0;
    })
    .withMessage("Ticket price must be a positive integer"),

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
      return true;
    })
    .isBoolean()
    .withMessage("isAnnouncementEnabled must be a boolean"),
  body("announcement")
    .optional()
    .isString()
    .withMessage("Announcement must be a string"),

  // Additional fields
  body("isDraft")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.isDraft = true;
        } else if (value === "false") {
          req.body.isDraft = false;
        }
      }
      return true;
    })
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  body("formStep")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        req.body.formStep = parseInt(req.body.formStep);
      }
      return true;
    })
    .isInt({ min: 1, max: 6 })
    .withMessage("Form step must be an integer between 1 and 6"),
];

export const generateAnnouncementValidator = () => [
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
      return Array.isArray(value) && value.length > 0;
    })
    .withMessage("Event categories must be a non-empty array"),

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
  body("audience")
    .isIn(["Open", "Members", "Invite"])
    .withMessage("Invalid audience type"),
  body("registrationRequired")
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.registrationRequired = true;
        } else if (value === "false") {
          req.body.registrationRequired = false;
        }
      }
      return true;
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
];

export const updateEventValidator = () => [
  // Section 1: Basic Event Information
  body("title")
    .optional()
    .isString()
    .withMessage("Event title must be a string"),
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
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            req.body.categories = parsedValue;
            return true;
          } else {
            throw new Error("Event categories must be an array");
          }
        } catch (e: any) {
          throw new Error(
            e.message || "Event categories must be a valid JSON array"
          );
        }
      }
      return Array.isArray(value);
    })
    .withMessage("Event categories must be an array"),

  // Section 2: Date & Time
  body("startDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .toDate()
    .withMessage("Start date must be in YYYY-MM-DD format"),
  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
  body("endDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .toDate()
    .withMessage("End date must be in YYYY-MM-DD format"),
  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),

  // Section 3: Location
  body("eventType")
    .optional()
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

  // Section 4: Audience & Visibility
  body("audience")
    .optional()
    .isIn(["Open", "Members", "Invite"])
    .withMessage("Invalid audience type"),
  body("visibility")
    .optional()
    .isIn(["Publish", "Draft", "Schedule"])
    .withMessage("Invalid visibility type"),
  body("registrationDeadline")
    .optional()
    .custom((value) => {
      if (value === "") return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage("Registration deadline must be a valid date"),

  // Section 5: Registration
  body("registrationRequired")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.registrationRequired = true;
        } else if (value === "false") {
          req.body.registrationRequired = false;
        }
      }
      return true;
    })
    .isBoolean()
    .withMessage("registrationRequired must be a boolean"),
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

  // Section 6: Announcement
  body("announcementEnabled")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.announcementEnabled = true;
        } else if (value === "false") {
          req.body.announcementEnabled = false;
        }
      }
      return true;
    })
    .isBoolean()
    .withMessage("isAnnouncementEnabled must be a boolean"),
  body("announcement")
    .optional()
    .isString()
    .withMessage("Announcement must be a string"),

  // Additional fields
  body("isDraft")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        if (value === "true") {
          req.body.isDraft = true;
        } else if (value === "false") {
          req.body.isDraft = false;
        }
      }
      return true;
    })
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  body("formStep")
    .optional()
    .custom((value, { req }) => {
      if (typeof value === "string") {
        req.body.formStep = parseInt(req.body.formStep);
      }
      return true;
    })
    .isInt({ min: 1, max: 6 })
    .withMessage("Form step must be an integer between 1 and 6"),
];

export const scanTicketValidator = () => [
  body("registrationId").notEmpty().withMessage("Registration ID is required"),
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("studentId").notEmpty().withMessage("Student ID is required"),
  body("societyId").notEmpty().withMessage("Society ID is required"),
];
