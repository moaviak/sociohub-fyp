import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import {
  createSocietyValidator,
  removeMemberValidator,
  societySettingsValidator,
  updateSocietyProfileValidator,
} from "../validators/society.validators";
import { validate } from "../validators/validate";
import {
  createSociety,
  getSocieties,
  getSociety,
  getSocietyMembers,
  removeMember,
  updateSettings,
  updateSocietyProfile,
} from "../controllers/society.controller";
import {
  verifyMemberPrivilege,
  verifySettingsPrivilege,
} from "../middlewares/privilege.middlewares";
import RequestRouter from "./request.routes";
import RolesRouter from "./roles.routes";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("logo"),
    createSocietyValidator(),
    validate,
    createSociety
  )
  .get(verifyJWT, getSocieties);

router.route("/:societyId").get(verifyJWT, getSociety);

router.use("/requests", RequestRouter);

router
  .route("/members/:societyId")
  .get(verifyJWT, getSocietyMembers)
  .delete(
    verifyJWT,
    verifyMemberPrivilege,
    removeMemberValidator(),
    validate,
    removeMember
  );

router.use("/roles", RolesRouter);

router
  .route("/settings/:societyId")
  .patch(
    verifyJWT,
    verifySettingsPrivilege,
    societySettingsValidator(),
    validate,
    updateSettings
  );

router
  .route("/profile/:societyId")
  .patch(
    verifyJWT,
    upload.single("logo"),
    updateSocietyProfileValidator(),
    validate,
    updateSocietyProfile
  );

export default router;
