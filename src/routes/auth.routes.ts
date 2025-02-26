import { Router } from "express";

import {
  userLoginValidator,
  verifyEmailValidator,
} from "../validators/auth.validators";
import {
  loginUser,
  refreshAccessToken,
  verifyEmail,
  resendEmailVerification,
} from "../controllers/auth.controller";
import { validate } from "../validators/validate";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/verify-email")
  .post(verifyEmailValidator(), validate, verifyEmail);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

export default router;
