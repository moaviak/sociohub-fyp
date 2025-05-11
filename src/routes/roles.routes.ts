import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyMemberPrivilege } from "../middlewares/privilege.middlewares";
import {
  assignRolesToStudent,
  createRole,
  deleteRole,
  getSocietyRoles,
  updateRole,
} from "../controllers/roles.controller";
import {
  assignRolesToStudentValidator,
  createRoleValidator,
  deleteRoleValidator,
  updateRoleValidator,
} from "../validators/roles.validators";
import { validate } from "../validators/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";

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

router.post(
  "/:societyId/assign-roles",
  verifyJWT,
  verifyMemberPrivilege,
  assignRolesToStudentValidator(),
  validate,
  assignRolesToStudent
);

export default router;
