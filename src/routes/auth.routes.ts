import { Router } from "express";
import { userLoginValidator } from "../validators/auth.validators";
import { validate } from "../validators/validate";
import {
  loginUser,
  refreshAccessToken,
  verifyEmail,
} from "../controllers/auth.controller";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);

export default router;
