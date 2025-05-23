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
  getCurrentUser,
  logoutUser,
} from "../controllers/auth.controller";
import { validate } from "../validators/validate";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh").post(refreshAccessToken);
router
  .route("/verify-email")
  .post(verifyEmailValidator(), validate, verifyJWT, verifyEmail);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

router.route("/me").get(verifyJWT, getCurrentUser);

router.route("/logout").post(verifyJWT, logoutUser);

export default router;
