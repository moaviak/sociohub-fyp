import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyAnnouncementsPrivilege } from "../middlewares/privilege.middlewares";
import {
  createAnnouncementValidator,
  updateAnnouncementValidator,
} from "../validators/announcements.validators";
import { validate } from "../validators/validate";
import {
  createAnnouncement,
  getSocietyAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getRecentAnnouncements,
} from "../controllers/announcements.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyAnnouncementsPrivilege,
    createAnnouncementValidator(),
    validate,
    createAnnouncement
  )
  .get(verifyJWT, getRecentAnnouncements);

// GET /society-announcements/:societyId - fetch all announcements for a society
router.get(
  "/society-announcements/:societyId",
  verifyJWT,
  getSocietyAnnouncements
);

router
  .route("/:announcementId")
  .get(verifyJWT, getAnnouncementById)
  .patch(
    verifyJWT,
    verifyAnnouncementsPrivilege,
    updateAnnouncementValidator(),
    validate,
    updateAnnouncement
  )
  .delete(verifyJWT, verifyAnnouncementsPrivilege, deleteAnnouncement);

export default router;
