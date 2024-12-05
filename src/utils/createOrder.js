import httpStatus from "http-status";
import { stripe } from "../app.js";
import config from "../config/index.js";
import ApiError from "../error/ApiError.js";
import { dateFormatter } from "../helper/dateFormatter.js";
import { Invoice } from "../model/invoice.model.js";
import {
  Order,
  OrderConversation,
  TemporaryOrder,
} from "../model/order.model.js";
import { Package } from "../model/package.model.js";
import { System } from "../model/system.model.js";
import User from "../model/user.model.js";
import { sendOrderInvoiceToCustomer } from "../shared/nodeMailer.js";
import calculateAdditionalItemPrice from "../utils/calculateAdditionalItemPrice.js";
import calculateDeliveryDate from "../utils/calculateDeliveryDate.js";
import calculateRevisionCount from "../utils/calculateRevisionCount.js";
import generateInvoiceId from "../utils/generateInvoiceId.js";
import generateOrderId from "../utils/generateOrderId.js";
import packagePriceConversion from "../utils/packagePriceConversion.js";

export const createOrder = async (payload) => {
  const {
    userId,
    packageId,
    category,
    paymentIntentId,
    contactDetails,
    additionalEmail,
    requirements = [],
    referredImages = [],
    preferredColors = [],
    preferredDesigns = [],
    selectedAdditionalFeats = [],
    selectedAdditionalRevision = [],
    selectedAdditionalDeliveryTime = [],
    selectedProgrammingLang = [],
  } = payload;

  const isOrderExist = await Order.findOne({
    transactionId: { $in: [paymentIntentId] },
  });

  if (isOrderExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order already created!");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const existingUser = await User.findOne({ userId });

  const existingPackage = await Package.findOne({ packageId });

  const { UTC, dateString } = dateFormatter.getDates();

  const packagePrice = packagePriceConversion(existingPackage);

  const additionalFeatsPrice = calculateAdditionalItemPrice(
    selectedAdditionalFeats
  );

  const additionalRevisionPrice = calculateAdditionalItemPrice(
    selectedAdditionalRevision
  );

  const additionalDeliveryPrice = calculateAdditionalItemPrice(
    selectedAdditionalDeliveryTime
  );

  const additionalProgrammingLangPrice = calculateAdditionalItemPrice(
    selectedProgrammingLang
  );

  const totalPrice = Number(
    (
      packagePrice +
      additionalFeatsPrice +
      additionalRevisionPrice +
      additionalDeliveryPrice +
      additionalProgrammingLangPrice
    ).toFixed(2)
  );

  const { featuredRevision, featuredDeliveryTime } = existingPackage;

  const totalRevision = calculateRevisionCount(
    +featuredRevision?.split(" ")[0],
    selectedAdditionalRevision
  );

  const { deliveryDateUTC, deliveryDateString } = calculateDeliveryDate(
    +featuredDeliveryTime?.split(" ")[0],
    selectedAdditionalDeliveryTime
  );

  const orderId = await generateOrderId();
  const invoiceId = await generateInvoiceId();

  const newOrder = {
    user: existingUser._id,
    package: existingPackage._id,
    contactDetails: contactDetails,
    invoiceId: [invoiceId],
    orderId: orderId,
    packageId: packageId,
    userId: userId,
    category: category,
    paymentCurrency: paymentIntent.currency,
    paymentStatus: paymentIntent.status,
    email: existingUser.email,
    orderStatus: "in progress",
    additionalEmail: additionalEmail,
    transactionId: [paymentIntentId],
    referredImages: referredImages,
    requirements: requirements,
    preferredDesigns: preferredDesigns,
    preferredColors: preferredColors,
    additionalFeature: selectedAdditionalFeats,
    additionalRevision: selectedAdditionalRevision,
    additionalDeliveryTime: selectedAdditionalDeliveryTime,
    additionalProgrammingLang: selectedProgrammingLang,
    totalRevision: totalRevision,
    usedRevision: 0,
    packagePrice: packagePrice,
    totalPrice: totalPrice,
    orderDateUTC: UTC,
    orderDateString: dateString,
    deliveryDateUTC: deliveryDateUTC,
    deliveryDateString: deliveryDateString,
    paymentDateString: dateString,
  };

  const newInvoice = {
    date: dateString,
    invoiceId: invoiceId,
    transactionId: paymentIntentId,
    orderId: orderId,
    packageId: packageId,
    name: `${contactDetails?.firstName} ${contactDetails?.lastName}`,
    email: existingUser.email || additionalEmail,
    phone: contactDetails?.phone,
    country: contactDetails?.country,
    packageTitle: existingPackage?.title,
    type: "new",
    items: [
      ...selectedAdditionalFeats,
      ...selectedAdditionalRevision,
      ...selectedAdditionalDeliveryTime,
      ...selectedProgrammingLang,
    ],
    subtotal: totalPrice - packagePrice,
    packagePrice: packagePrice,
    total: totalPrice,
  };

  const createdOrder = await Order.create(newOrder);
  const createdInvoice = await Invoice.create(newInvoice);

  const admin = await User.findOne({ role: config.super_admin_role });

  const createdConversation = await OrderConversation.create({
    order: createdOrder._id,
    creator: existingUser._id,
    participant: admin._id,
    lastUpdated: UTC,
    messageType: "order",
  });

  await Order.findOneAndUpdate(
    { _id: createdOrder._id },
    {
      conversation: createdConversation._id,
    }
  );

  const systemData = await System.findOne({ systemId: "system-1" });

  if (createdOrder?.additionalEmail !== createdOrder?.email) {
    await sendOrderInvoiceToCustomer(
      newInvoice,
      createdOrder?.email,
      systemData.logo
    );
    await sendOrderInvoiceToCustomer(
      newInvoice,
      createdOrder?.additionalEmail,
      systemData.logo
    );
  }

  await sendOrderInvoiceToCustomer(
    newInvoice,
    createdOrder?.email,
    systemData.logo
  );

  return createdOrder;
};

export const createTemporaryGeneralOrder = async (payload, userId) => {
  const {
    userId: givenUserId,
    packageId,
    category,
    contactDetails,
    additionalEmail,
    requirements = [],
    referredImages = [],
    preferredColors = [],
    preferredDesigns = [],
    selectedAdditionalFeats = [],
    selectedAdditionalRevision = [],
    selectedAdditionalDeliveryTime = [],
    selectedProgrammingLang = [],
  } = payload;

  if (givenUserId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "User ID doesn't match!");
  }

  const existingUser = await User.findOne({ userId: givenUserId });

  if (!existingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "User doesn't exist!");
  }

  const existingPackage = await Package.findOne({ packageId });

  if (!existingPackage) {
    throw new ApiError(httpStatus.FORBIDDEN, "Package doesn't exist!");
  }

  const { UTC, dateString } = dateFormatter.getDates();

  const packagePrice = packagePriceConversion(existingPackage);

  const additionalFeatsPrice = calculateAdditionalItemPrice(
    selectedAdditionalFeats
  );

  const additionalRevisionPrice = calculateAdditionalItemPrice(
    selectedAdditionalRevision
  );

  const additionalDeliveryPrice = calculateAdditionalItemPrice(
    selectedAdditionalDeliveryTime
  );

  const additionalProgrammingLangPrice = calculateAdditionalItemPrice(
    selectedProgrammingLang
  );

  const totalPrice = Number(
    (
      packagePrice +
      additionalFeatsPrice +
      additionalRevisionPrice +
      additionalDeliveryPrice +
      additionalProgrammingLangPrice
    ).toFixed(2)
  );

  const { featuredRevision, featuredDeliveryTime } = existingPackage;

  const totalRevision = calculateRevisionCount(
    +featuredRevision?.split(" ")[0],
    selectedAdditionalRevision
  );

  const { deliveryDateUTC, deliveryDateString } = calculateDeliveryDate(
    +featuredDeliveryTime?.split(" ")[0],
    selectedAdditionalDeliveryTime
  );

  const orderId = await generateOrderId();

  const newOrder = {
    user: existingUser._id,
    package: existingPackage._id,
    contactDetails: contactDetails,
    orderId: orderId,
    packageId: packageId,
    userId: userId,
    category: category,
    email: existingUser.email,
    orderStatus: "in progress",
    additionalEmail: additionalEmail,
    referredImages: referredImages,
    requirements: requirements,
    preferredDesigns: preferredDesigns,
    preferredColors: preferredColors,
    additionalFeature: selectedAdditionalFeats,
    additionalRevision: selectedAdditionalRevision,
    additionalDeliveryTime: selectedAdditionalDeliveryTime,
    additionalProgrammingLang: selectedProgrammingLang,
    totalRevision: totalRevision,
    usedRevision: 0,
    packagePrice: packagePrice,
    totalPrice: totalPrice,
    orderDateUTC: UTC,
    orderDateString: dateString,
    deliveryDateUTC: deliveryDateUTC,
    deliveryDateString: deliveryDateString,
    paymentDateString: dateString,
  };

  const createdOrder = await TemporaryOrder.create(newOrder);

  return {
    additionalEmail: additionalEmail,
    firstName: contactDetails.firstName,
    lastName: contactDetails.lastName,
    totalPrice: totalPrice,
    orderId: orderId,
  };
};
