import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { createEventValidator } from "../validators/events.validators";
import { draftEventValidator } from "../validators/events.draft.validators";
import { validate } from "../validators/validate";
import {
  createEvent,
  saveDraft,
  getDraft,
  getDrafts,
} from "../controllers/event.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("banner"),
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

export default router;
