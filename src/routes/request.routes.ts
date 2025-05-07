import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyMemberPrivilege } from "../middlewares/privilege.middlewares";
import { handleRequestValidator } from "../validators/request.validators";
import { validate } from "../validators/validate";
import {
  getRequestsHistory,
  getSocietyRequests,
  handleRequest,
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
  );

router
  .route("/:id/history")
  .get(verifyJWT, verifyMemberPrivilege, getRequestsHistory);

export default router;
