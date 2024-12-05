import express from "express";
import { PaymentController } from "../../controller/secure/payment.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { PaymentValidation } from "../../validation/payment.validation.js";

const router = express.Router();

router.post(
  "/payment/create-custom-offer-payment-intent",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(PaymentValidation.createCustomOfferPaymentIntentZod),
  PaymentController.createCustomOfferPaymentIntent
);

router.post(
  "/payment/create-extra-features-payment-intent",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(PaymentValidation.createExtraFeaturesPaymentIntentZod),
  PaymentController.createExtraFeaturesPaymentIntent
);

router.post(
  "/payment/create-payment-intent",
  auth(ENUM_USER_ROLE.USER),
  validateRequest(PaymentValidation.createPaymentIntentZod),
  PaymentController.createPaymentIntent
);

router.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhookHandler
);

// router.post(
//   "/payment/webhook",
//   express.raw({ type: "application/json" }), (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     const endpointSecret = "whsec_YM6ywEGYHv1rm3jPIgLXFG7cLUZyK2LE";

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
//     } catch (err) {
//       console.log(err)
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.canceled':
//         const paymentIntentCanceled = event.data.object;
//         // Then define and call a function to handle the event payment_intent.canceled
//         break;
//       case 'payment_intent.payment_failed':
//         const paymentIntentPaymentFailed = event.data.object;
//         // Then define and call a function to handle the event payment_intent.payment_failed
//         break;
//       case 'payment_intent.succeeded':
//         const paymentIntentSucceeded = event.data.object;
//         console.log('object')
//         // Then define and call a function to handle the event payment_intent.succeeded
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
// });

// router.post(
//   "/payment/create-package-checkout-session",
//   auth(ENUM_USER_ROLE.USER),
//   PaymentController.createCheckoutSession
// );

export const PaymentRoutes = router;
