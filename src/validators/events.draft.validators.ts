import { body } from "express-validator";
import { EventCategories } from "@prisma/client";

const stepValidators = {
  1: [
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
  ],
  2: [
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
  ],
  3: [
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
  ],
  4: [
    body("audience")
      .isIn(["Open", "Members", "Invite"])
      .withMessage("Invalid audience type"),
    body("visibility")
      .isIn(["Publish", "Draft", "Schedule"])
      .withMessage("Invalid visibility type"),
    body("registrationDeadline")
      .optional()
      .custom((value) => {
        if (value === "") return true;
        return !isNaN(Date.parse(value));
      })
      .withMessage("Registration deadline must be a valid date"),
  ],
  5: [
    body("registrationRequired")
      .custom((value, { req }) => {
        if (typeof value === "string") {
          req.body.registrationRequired = value === "true";
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
      .custom((value, { req }) => {
        if (typeof value === "string") {
          req.body.paidEvent = value === "true";
        }
        return true;
      })
      .isBoolean()
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
      .optional()
      .custom((value, { req }) => {
        if (value === undefined || value === null || value === "") {
          req.body.paymentMethods = [];
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

        return Array.isArray(value);
      })
      .withMessage("Payment methods must be an array"),
  ],
  6: [
    body("announcementEnabled")
      .custom((value, { req }) => {
        if (typeof value === "string") {
          req.body.announcementEnabled = value === "true";
        }
        return true;
      })
      .isBoolean()
      .withMessage("isAnnouncementEnabled must be a boolean"),
    body("announcement")
      .optional()
      .isString()
      .withMessage("Announcement must be a string"),
  ],
};

export const draftEventValidator = () => [
  body("eventId").optional().isUUID().withMessage("Invalid event ID"),
  body("societyId").notEmpty().withMessage("Society ID is required"),
  body("formStep")
    .isInt({ min: 1, max: 6 })
    .withMessage("Form step must be an integer between 1 and 6"),
  (req: any, res: any, next: any) => {
    const step = parseInt(req.body.formStep);
    const stepValidatorArray =
      stepValidators[step as keyof typeof stepValidators];
    if (!stepValidatorArray) {
      return res.status(400).json({
        status: "error",
        message: "Invalid form step",
      });
    }
    // Run validators for current and all previous steps
    const validatorsToRun = Array.from({ length: step }, (_, i) => i + 1)
      .map((s) => stepValidators[s as keyof typeof stepValidators])
      .flat();

    Promise.all(validatorsToRun.map((validator) => validator.run(req)))
      .then(() => next())
      .catch(next);
  },
];
