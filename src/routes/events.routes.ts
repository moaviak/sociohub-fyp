import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import {
  createEventValidator,
  generateAnnouncementValidator,
} from "../validators/events.validators";
import { draftEventValidator } from "../validators/events.draft.validators";
import { validate } from "../validators/validate";
import {
  createEvent,
  saveDraft,
  getDraft,
  getDrafts,
  generateAnnouncement,
} from "../controllers/event.controller";
import { verifyEventsPrivilege } from "../middlewares/privilege.middlewares";

const router = Router();

router
  .route("/")
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

export default router;
