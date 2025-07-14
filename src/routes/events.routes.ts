import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import {
  createEventValidator,
  generateAnnouncementValidator,
  scanTicketValidator,
  updateEventValidator,
} from "../validators/events.validators";
import { draftEventValidator } from "../validators/events.draft.validators";
import { validate } from "../validators/validate";
import {
  createEvent,
  saveDraft,
  getDraft,
  getDrafts,
  generateAnnouncement,
  getEvents,
  getEventById,
  updateEvent,
  registerForEvent,
  deleteEvent,
  cancelEvent,
  getUserRegisteredEvents,
  scanTicket,
  completeRegistration,
  cancelRegistration,
} from "../controllers/event.controller";
import { verifyEventsPrivilege } from "../middlewares/privilege.middlewares";
import { body } from "express-validator";

const router = Router();

router
  .route("/")
  .get(verifyJWT, getEvents)
  .post(
    verifyJWT,
    upload.single("banner"),
    verifyEventsPrivilege,
    createEventValidator(),
    validate,
    createEvent
  );

// Draft routes
router
  .route("/drafts")
  .post(
    verifyJWT,
    upload.single("banner"),
    verifyEventsPrivilege,
    draftEventValidator(),
    validate,
    saveDraft
  )
  .get(
    verifyJWT,
    (req, res, next) => {
      (req.params as { [key: string]: any }).societyId = req.query
        .societyId as string;
      next();
    },
    getDrafts
  );

router.route("/drafts/:eventId").get(
  verifyJWT,
  (req, res, next) => {
    (req.params as { [key: string]: any }).societyId = req.query
      .societyId as string;
    next();
  },
  getDraft
);

router
  .route("/generate-announcement")
  .put(
    verifyJWT,
    generateAnnouncementValidator(),
    validate,
    generateAnnouncement
  );

// Add user registered events endpoint
router.get("/my-registrations", verifyJWT, getUserRegisteredEvents);

// Ticket scan endpoint (admin only)
router.post(
  "/scan-ticket",
  verifyJWT,
  scanTicketValidator(),
  validate,
  verifyEventsPrivilege,
  scanTicket
);

// Get event by ID
router.route("/:eventId").get(verifyJWT, getEventById);

// Update event by ID
router
  .route("/:eventId")
  .put(
    verifyJWT,
    upload.single("banner"),
    verifyEventsPrivilege,
    updateEventValidator(),
    validate,
    updateEvent
  )
  .delete(verifyJWT, verifyEventsPrivilege, deleteEvent);

// Cancel event by ID
router.patch("/:eventId/cancel", verifyJWT, verifyEventsPrivilege, cancelEvent);

// Add registration endpoint
router.post(
  "/:eventId/register",
  verifyJWT,
  (req, res, next) => {
    req.body.eventId = req.params.eventId;
    next();
  },
  registerForEvent
);

router.post("/:registrationId/complete", verifyJWT, completeRegistration);

router.post("/:registrationId/cancel", verifyJWT, cancelRegistration);

export default router;
