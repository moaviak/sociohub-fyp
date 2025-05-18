import { body, check } from "express-validator";

export const createEventValidator = () => [
  // Section 1: Basic Event Information
  body("eventTitle").notEmpty().withMessage("Event title is required"),
  body("eventTagline")
    .optional()
    .isString()
    .withMessage("Tagline must be a string")
    .isLength({ max: 150 })
    .withMessage("Tagline must be 150 characters or less"),
  body("detailedDescription")
    .optional()
    .isString()
    .withMessage("Detailed description must be a string"),
  body("eventCategories")
    .isArray()
    .withMessage("Event categories must be an array")
    .notEmpty()
    .withMessage("Please select at least one category"),
  // Note: File validation is typically handled by middleware like Multer, not express-validator body checks.
  // body('eventImage').optional(), // Placeholder, actual file validation needed elsewhere

  // Section 2: Date & Time
  body("startDate")
    .isISO8601()
    .toDate()
    .withMessage("Start date is required and must be a valid date"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
  body("endDate")
    .isISO8601()
    .toDate()
    .withMessage("End date is required and must be a valid date"),
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
    .isString()
    .withMessage("Venue name must be a string"),
  body("address").optional().isString().withMessage("Address must be a string"),
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
    .isURL()
    .withMessage("Please enter a valid URL"),
  body("accessInstructions")
    .optional()
    .isString()
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
  body("isRegistrationRequired")
    .isBoolean()
    .withMessage("isRegistrationRequired must be a boolean"),
  body("registrationDeadline")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Registration deadline must be a valid date"),
  body("maximumParticipants")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Maximum participants must be a positive integer"),
  body("isPaidEvent")
    .optional()
    .isBoolean()
    .withMessage("isPaidEvent must be a boolean"),
  body("ticketPrice")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Ticket price must be a positive number"),
  body("paymentGateways")
    .optional()
    .isArray()
    .withMessage("Payment gateways must be an array"),
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
  body("isAnnouncementEnabled")
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
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  body("formStep")
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
