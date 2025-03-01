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
  handleGoogleLogin,
} from "../controllers/auth.controller";
import { validate } from "../validators/validate";
import { verifyJWT } from "../middlewares/auth.middlewares";
import passport from "passport";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/verify-email")
  .post(verifyEmailValidator(), validate, verifyEmail);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

router.route("/me").get(verifyJWT, getCurrentUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleGoogleLogin);

export default router;
