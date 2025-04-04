import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import {
  createSocietyValidator,
  handleRequestValidator,
  removeMemberValidator,
} from "../validators/society.validators";
import { validate } from "../validators/validate";
import {
  createSociety,
  getSocieties,
  getSocietyMembers,
  getSocietyRequests,
  handleRequest,
  removeMember,
} from "../controllers/society.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("logo"),
    createSocietyValidator(),
    validate,
    createSociety
  )
  .get(verifyJWT, getSocieties);

router
  .route("/requests/:societyId")
  .get(verifyJWT, getSocietyRequests)
  .put(verifyJWT, handleRequestValidator(), validate, handleRequest);

router
  .route("/members/:societyId")
  .get(verifyJWT, getSocietyMembers)
  .delete(verifyJWT, removeMemberValidator(), validate, removeMember);

export default router;
