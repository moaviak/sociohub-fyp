import { Router } from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/message.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";

const router = Router();

router.use(verifyJWT);

router
  .route("/:chatId")
  .post(upload.array("attachments", 5), sendMessage)
  .get(getMessages);

router.route("/:messageId").delete(deleteMessage);

export default router;
