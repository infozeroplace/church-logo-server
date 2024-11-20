import express from "express";
import { ChatController } from "../../controller/secure/chat.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ChatValidation } from "../../validation/chat.validation.js";

const router = express.Router();

router.get(
  "/chat/get-conversation-id",
  auth(ENUM_USER_ROLE.USER),
  ChatController.getConversationId
);

router.get(
  "/chat/get-unread-messages",
  auth(ENUM_USER_ROLE.USER),
  ChatController.getUnreadMessages
);

router.post(
  "/send-message",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(ChatValidation.sendMessageZodSchema),
  ChatController.sendMessage
);

router.get("/get-inbox", auth(ENUM_USER_ROLE.USER), ChatController.getInbox);

router.get(
  "/get-messages",
  auth(ENUM_USER_ROLE.USER),
  ChatController.getMessages
);

export const ChatRoutes = router;
