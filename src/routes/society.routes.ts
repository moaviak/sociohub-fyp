import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import {
  createRoleValidator,
  createSocietyValidator,
  deleteRoleValidator,
  handleRequestValidator,
  removeMemberValidator,
  updateRoleValidator,
} from "../validators/society.validators";
import { validate } from "../validators/validate";
import {
  createSociety,
  getRequestsHistory,
  getSocieties,
  getSocietyMembers,
  getSocietyRequests,
  handleRequest,
  removeMember,
} from "../controllers/society.controller";
import { verifyMemberPrivilege } from "../middlewares/privilege.middlewares";
import {
  createRole,
  deleteRole,
  getSocietyRoles,
  updateRole,
} from "../controllers/roles.controller";

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

router
  .route("/requests/:societyId")
  .get(verifyJWT, verifyMemberPrivilege, getSocietyRequests)
  .put(
    verifyJWT,
    verifyMemberPrivilege,
    handleRequestValidator(),
    validate,
    handleRequest
  );

router
  .route("/requests/:id/history")
  .get(verifyJWT, verifyMemberPrivilege, getRequestsHistory);

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

router
  .route("/roles/:societyId")
  .get(verifyJWT, verifyMemberPrivilege, getSocietyRoles)
  .post(
    verifyJWT,
    verifyMemberPrivilege,
    createRoleValidator(),
    validate,
    createRole
  )
  .put(
    verifyJWT,
    verifyMemberPrivilege,
    updateRoleValidator(),
    validate,
    updateRole
  )
  .delete(
    verifyJWT,
    verifyMemberPrivilege,
    deleteRoleValidator(),
    validate,
    deleteRole
  );

export default router;
