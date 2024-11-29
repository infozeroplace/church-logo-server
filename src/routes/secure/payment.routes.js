// import bodyParser from "body-parser";
import express from "express";
import { PaymentController } from "../../controller/secure/payment.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/payment/create-payment-intent",
  auth(ENUM_USER_ROLE.USER),
  PaymentController.createPaymentIntent
);

router.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhookHandler
);

router.post(
  "/payment/create-package-checkout-session",
  auth(ENUM_USER_ROLE.USER),
  PaymentController.createCheckoutSession
);

export const PaymentRoutes = router;
