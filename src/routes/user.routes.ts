import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { userProfileUpdateValidator } from "../validators/user.validators";
import { validate } from "../validators/validate";

const router = Router();

router.route("/").get(verifyJWT, getAllUsers);
router.route("/:id").get(verifyJWT, getUserById);
router
  .route("/profile")
  .patch(
    verifyJWT,
    upload.single("avatar"),
    userProfileUpdateValidator(),
    validate,
    updateUserProfile
  );

export default router;
