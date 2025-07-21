import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  searchUsers,
  updateUserProfile,
} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { userProfileUpdateValidator } from "../validators/user.validators";
import { validate } from "../validators/validate";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllUsers);
router.route("/search").get(searchUsers);
router.route("/:id").get(getUserById);
router
  .route("/profile")
  .patch(
    upload.single("avatar"),
    userProfileUpdateValidator(),
    validate,
    updateUserProfile
  );

export default router;
