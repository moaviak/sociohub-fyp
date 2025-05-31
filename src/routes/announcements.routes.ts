import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyAnnouncementsPrivilege } from "../middlewares/privilege.middlewares";
import { createAnnouncementValidator } from "../validators/announcements.validators";
import { validate } from "../validators/validate";
import { createAnnouncement } from "../controllers/announcements.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyAnnouncementsPrivilege,
    createAnnouncementValidator(),
    validate,
    createAnnouncement
  );

export default router;
