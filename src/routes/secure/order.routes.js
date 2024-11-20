import express from "express";
import { OrderController } from "../../controller/secure/order.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { OrderValidation } from "../../validation/order.validation.js";

const router = express.Router();

router.post(
  "/order/add-review",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(OrderValidation.addReview),
  OrderController.addReview
);

router.get(
  "/order/get-order-count",
  auth(ENUM_USER_ROLE.USER),
  OrderController.getOrderCount
);

router.put(
  "/order/add-extra-features",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(OrderValidation.addExtraFeatures),
  OrderController.addExtraFeatures
);

router.put(
  "/order/update-order-message-action",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(OrderValidation.updateOrderMessageAction),
  OrderController.updateOrderMessageAction
);

router.get(
  "/order/get-order-unread-messages",
  auth(ENUM_USER_ROLE.USER),
  OrderController.getOrderUnreadMessages
);

router.post(
  "/order/send-order-message",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.sendOrderMessageZodSchema),
  OrderController.sendOrderMessage
);

router.get(
  "/order/get-order-messages",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.getOrderMessages
);

router.get(
  "/order/order-list",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.getOrderList
);

router.post(
  "/order/submit",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.orderSubmissionZodSchema),
  OrderController.orderSubmission
);

router.get(
  "/order/:id",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.getOneOrder
);

export const OrderRoutes = router;
