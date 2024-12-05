import httpStatus from "http-status";
import { PaymentService } from "../../service/secure/payment.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const createCustomOfferPaymentIntent = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user.userId;

  const result = await PaymentService.createCustomOfferPaymentIntent(
    data,
    userId
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment intent successful",
    meta: null,
    data: result,
  });
});

const createExtraFeaturesPaymentIntent = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user.userId;

  const result = await PaymentService.createExtraFeaturesPaymentIntent(
    data,
    userId
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment intent successful",
    meta: null,
    data: result,
  });
});

const createPaymentIntent = catchAsync(async (req, res) => {
  const { ...data } = req.body;
  const userId = req.user.userId;

  const result = await PaymentService.createPaymentIntent(data, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment intent successful",
    meta: null,
    data: result,
  });
});

const stripeWebhookHandler = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const data = req.body;

  console.log(sig)
  console.log(data)

  await PaymentService.handleWebhookEvent(data, sig);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Done",
    meta: null,
    data: null,
  });
});

const createCheckoutSession = catchAsync(async (req, res) => {
  const { ...data } = req.body;
  const userId = req.user.userId;

  const result = await PaymentService.createCheckoutSession(data, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Session id retrieved successfully",
    meta: null,
    data: result,
  });
});

export const PaymentController = {
  createCustomOfferPaymentIntent,
  createExtraFeaturesPaymentIntent,
  createPaymentIntent,
  stripeWebhookHandler,
  createCheckoutSession,
};
