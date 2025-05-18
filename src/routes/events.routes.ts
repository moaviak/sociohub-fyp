import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { createEventValidator } from "../validators/events.validators";
import { validate } from "../validators/validate";
import { createEvent } from "../controllers/event.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("eventImage"),
    createEventValidator(),
    validate,
    createEvent
  );

export default router;
