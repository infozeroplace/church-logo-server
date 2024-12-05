import httpStatus from "http-status";
import { stripe } from "../../app.js";
import config from "../../config/index.js";
import ApiError from "../../error/ApiError.js";
import { Order, TemporaryOrder } from "../../model/order.model.js";
import User from "../../model/user.model.js";
import {
  createOrder,
  createTemporaryGeneralOrder,
} from "../../utils/createOrder.js";

const endpointSecret = config.stripe_endpoint_secret_key;

const createCustomOfferPaymentIntent = async (payload, userId) => {
  const { givenUserId, price } = payload;

  if (givenUserId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "User ID doesn't match!");
  }

  const existingUser = await User.findOne({ userId: givenUserId });

  if (!existingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "User doesn't exist!");
  }

  const customer = await stripe.customers.create({
    email: existingUser.email,
    name: `${existingUser.firstName} ${existingUser.lastName}`,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "usd",
    amount: Math.round(Number(price.toFixed(2)) * 100),
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    receipt_email: existingUser.email,
  });

  return paymentIntent.client_secret;
};

const createExtraFeaturesPaymentIntent = async (payload, userId) => {
  const { extraFeatures, orderId, givenUserId } = payload;

  if (givenUserId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "User ID doesn't match!");
  }

  const existingUser = await User.findOne({ userId: givenUserId });

  if (!existingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "User doesn't exist!");
  }

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) {
    throw new ApiError(httpStatus.FORBIDDEN, "Order doesn't exist!");
  }

  const totalPrice = extraFeatures.reduce((total, item) => {
    return total + (item.price || 0); // Ensure `price` exists
  }, 0);

  const customer = await stripe.customers.create({
    email: existingOrder.additionalEmail,
    name: `${existingOrder.contactDetails.firstName} ${existingOrder.contactDetails.lastName}`,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "usd",
    amount: Math.round(Number(totalPrice.toFixed(2)) * 100),
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    receipt_email: existingOrder.additionalEmail,
  });

  return paymentIntent.client_secret;
};

const createPaymentIntent = async (payload, userId) => {
  const { additionalEmail, firstName, lastName, totalPrice, orderId } =
    await createTemporaryGeneralOrder(payload, userId);

  const customer = await stripe.customers.create({
    email: additionalEmail,
    name: `${firstName} ${lastName}`,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "usd",
    amount: Math.round(totalPrice * 100),
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: orderId,
      orderType: "general-order",
    },
    receipt_email: additionalEmail,
  });

  return paymentIntent.client_secret;
};

const handleWebhookEvent = async (data, sig) => {
  const event = stripe.webhooks.constructEvent(data, sig, endpointSecret);

  const session = event?.data?.object;
  const { metadata, id } = session;

  const { orderId, orderType } = metadata;

  if (event.type === "payment_intent.succeeded") {
    if (orderType === "general-order") {
      const tempGeneralOrder = await TemporaryOrder.findOne({ orderId }).lean();

      await createOrder({
        ...tempGeneralOrder,
        paymentIntentId: id,
      });

      await TemporaryOrder.deleteOne({ orderId });
    }
  } else if (event.type === "payment_intent.payment_failed") {
    await TemporaryOrder.deleteOne({ orderId });
  } else if (event.type === "payment_intent.canceled") {
    await TemporaryOrder.deleteOne({ orderId });
  }
};

const createCheckoutSession = async (payload, userId) => {
  const orderData = await createOrder(payload, userId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "paypal"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: orderData.packageTitle,
            description: "A detailed description of the product",
          },
          unit_amount: Math.round(orderData.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    customer_email: orderData.additionalEmail,
    metadata: {
      orderId: orderData.orderId,
    },
    mode: "payment",
    success_url: `${config.frontend_base_url}${payload.successUrl}`,
    cancel_url: `${config.frontend_base_url}`,
  });

  return { sessionId: session.id };
};

export const PaymentService = {
  createCustomOfferPaymentIntent,
  createExtraFeaturesPaymentIntent,
  createPaymentIntent,
  handleWebhookEvent,
  createCheckoutSession,
};
