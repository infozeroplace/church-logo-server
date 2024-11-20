import express from "express";
import { ChatController } from "../../controller/private/chat.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ChatValidation } from "../../validation/chat.validation.js";

const router = express.Router();

router.get(
  "/chat/get-conversation-info:id",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  ChatController.getConversationInfo
);

router.get(
  "/chat/get-unread-messages",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  ChatController.getUnreadMessages
);

router.post(
  "/chat/send-admin-message",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  validateRequest(ChatValidation.sendMessageZodSchema),
  ChatController.sendAdminMessage
);

router.post(
  "/chat/send-message",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(ChatValidation.sendMessageZodSchema),
  ChatController.sendMessage
);

router.get(
  "/chat/get-inbox",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  ChatController.getInbox
);

router.get(
  "/chat/get-admin-messages",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  ChatController.getAdminMessages
);

router.get(
  "/chat/get-messages",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ChatController.getMessages
);

export const ChatRoutes = router;
