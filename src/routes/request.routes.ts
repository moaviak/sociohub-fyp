import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyMemberPrivilege } from "../middlewares/privilege.middlewares";
import {
  deleteRequestValidator,
  handleRequestValidator,
} from "../validators/request.validators";
import { validate } from "../validators/validate";
import {
  getRequestsHistory,
  getSocietyRequests,
  handleRequest,
  deleteRequest,
} from "../controllers/request.controller";

const router = Router();

router
  .route("/:societyId")
  .get(verifyJWT, verifyMemberPrivilege, getSocietyRequests)
  .put(
    verifyJWT,
    verifyMemberPrivilege,
    handleRequestValidator(),
    validate,
    handleRequest
  )
  .delete(
    verifyJWT,
    verifyMemberPrivilege,
    deleteRequestValidator(),
    validate,
    deleteRequest
  );

router
  .route("/:id/history")
  .get(verifyJWT, verifyMemberPrivilege, getRequestsHistory);

export default router;
