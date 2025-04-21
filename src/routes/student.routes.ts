import { Router } from "express";

import { validate } from "../validators/validate";
import {
  cancelJoinRequest,
  getMySocieties,
  registerStudent,
  sendJoinRequest,
} from "../controllers/student.controller";
import {
  societyJoinRequestValidator,
  studentRegisterValidator,
} from "../validators/student.validators";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/").post(studentRegisterValidator(), validate, registerStudent);

router
  .route("/send-request")
  .post(verifyJWT, societyJoinRequestValidator(), validate, sendJoinRequest);
router.route("/cancel-request/:societyId").delete(verifyJWT, cancelJoinRequest);

router.route("/societies").get(verifyJWT, getMySocieties);

export default router;
