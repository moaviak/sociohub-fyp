import { Router } from "express";
import {
  createGroupChat,
  getChats,
  renameGroupChat,
  addParticipant,
  removeParticipant,
  getOneToOneChat,
  markChatAsRead,
  getSuggestedUsers,
  addParticipants,
  deleteOneToOneChat,
  leaveGroupChat,
  deleteGroupChat,
} from "../controllers/chat.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getChats);
router.route("/suggested-users").get(getSuggestedUsers);
router.route("/group").post(upload.single("avatar"), createGroupChat);
router.route("/group/:chatId").put(renameGroupChat);
router.route("/group/:chatId/participants").post(addParticipant);
router.route("/group/:chatId/participants/bulk").post(addParticipants);
router
  .route("/group/:chatId/participants/:participantId")
  .delete(removeParticipant);
router.route("/one-on-one/:recipientId").post(getOneToOneChat);
router.route("/:chatId/read").post(markChatAsRead);
router.route("/one-on-one/:chatId").delete(deleteOneToOneChat);
router.route("/group/:chatId/leave").post(leaveGroupChat);
router.route("/group/:chatId").delete(deleteGroupChat);

export default router;
