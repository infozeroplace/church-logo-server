import express from "express";
import { OrderController } from "../../controller/private/order.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { OrderValidation } from "../../validation/order.validation.js";

const router = express.Router();

router.get(
  "/order/get-conversation-info:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OrderController.getConversationInfo
);

router.get(
  "/order/get-order-unread-messages",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OrderController.getOrderUnreadMessages
);

router.post(
  "/order/send-order-message",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(OrderValidation.sendOrderMessageZodSchema),
  OrderController.sendOrderMessage
);

router.get(
  "/order/get-order-messages",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OrderController.getOrderMessages
);

router.delete(
  "/order/delete-orders",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.deleteOrders
);

router.get(
  "/order/order-list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OrderController.getOrderList
);

router.get(
  "/order/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OrderController.getOrder
);

router.delete(
  "/order/delete-order/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.deleteOrder
);

export const OrderRoutes = router;
