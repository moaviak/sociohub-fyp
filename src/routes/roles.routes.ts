import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyMemberPrivilege } from "../middlewares/privilege.middlewares";
import {
  createRole,
  deleteRole,
  getSocietyRoles,
  updateRole,
} from "../controllers/roles.controller";
import {
  createRoleValidator,
  deleteRoleValidator,
  updateRoleValidator,
} from "../validators/roles.validators";
import { validate } from "../validators/validate";

const router = Router();

router
  .route("/:societyId")
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
