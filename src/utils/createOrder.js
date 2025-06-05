import fs from "fs";
import httpStatus from "http-status";
import path from "path";
import { __dirname, stripe } from "../app.js";
import config from "../config/index.js";
import ApiError from "../error/ApiError.js";
import { dateFormatter } from "../helper/dateFormatter.js";
import { Message } from "../model/chat.model.js";
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
import { getUsersFromAdminsAndClientsOnlineList } from "./socket.js";

/**
 * Save a base64 image to the server
 * @param {string} base64Image - The base64 encoded image
 * @param {string} folderPath - The directory to save the image
 * @returns {string} - The file path of the saved image
 */
const saveBase64Image = async (base64Image, folderPath) => {
  try {
    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Extract the file extension and base64 data
    const matches = base64Image.match(
      /^data:image\/(png|jpg|jpeg|svg|avif|webp);base64,(.+)$/
    );
    if (!matches) {
      throw new Error("Invalid base64 image format");
    }

    const extension = matches[1];
    const base64Data = matches[2];

    // Generate a unique file name
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${extension}`;
    const filePath = path.join(folderPath, uniqueName);

    // Write the image to the file system
    fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

    return uniqueName;
  } catch (error) {
    console.error("Error saving base64 image:", error.message);
    throw error;
  }
};

export const addExtraFeatures = async (payload) => {
  const { paymentIntentId, orderId, extraFeatures } = payload;

  const existingOrder = await Order.findById(orderId);
  const existingUser = await User.findOne({ userId: existingOrder.userId });
  const existingPackage = await Package.findOne({
    packageId: existingOrder.packageId,
  });

  const isOrderExist = await Order.findOne({
    transactionId: { $in: [paymentIntentId] },
  });

  if (isOrderExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order already created!");
  }

  if (!existingOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found!");
  }

  if (existingOrder.orderType === "custom") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot add!");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const parsedExtraFeatures = JSON.parse(extraFeatures);

  const totalExtraFeaturesCost = parsedExtraFeatures.reduce(
    (acc, feature) => acc + feature.price,
    0
  );

  const totalExtraPrice = Number(totalExtraFeaturesCost.toFixed(2));
  const totalExistingPrice = Number(existingOrder.totalPrice.toFixed(2));
  const totalPrice = Number((totalExistingPrice + totalExtraPrice).toFixed(2));

  const invoiceId = await generateInvoiceId();

  const result = await Order.findByIdAndUpdate(orderId, {
    $set: {
      additionalFeature: [
        ...parsedExtraFeatures,
        ...existingOrder.additionalFeature,
      ],
      totalPrice: totalPrice,
    },
    $push: {
      transactionId: { $each: [paymentIntentId] },
      invoiceId: { $each: [invoiceId] },
    },
  });

  const { dateString } = dateFormatter.getDates();

  const newInvoice = {
    date: dateString,
    invoiceId: invoiceId,
    transactionId: paymentIntentId,
    orderId: existingOrder.orderId,
    packageId: existingOrder.packageId,
    name: `${existingOrder.contactDetails?.firstName} ${existingOrder.contactDetails?.lastName}`,
    email: existingUser.email || existingOrder.additionalEmail,
    phone: existingOrder.contactDetails?.phone,
    country: existingOrder.contactDetails?.country,
    packageTitle: existingPackage?.title,
    type: "add ons",
    items: [...parsedExtraFeatures],
    subtotal: totalExtraPrice,
    packagePrice: 0,
    total: totalExtraPrice,
  };

  const createdInvoice = await Invoice.create(newInvoice);

  const systemData = await System.findOne({ systemId: "system-1" });

  if (existingOrder.additionalEmail !== existingOrder?.email) {
    await sendOrderInvoiceToCustomer(
      newInvoice,
      existingOrder?.email,
      systemData.logo
    );
    await sendOrderInvoiceToCustomer(
      newInvoice,
      existingOrder?.additionalEmail,
      systemData.logo
    );
  }

  await sendOrderInvoiceToCustomer(
    newInvoice,
    existingOrder?.email,
    systemData.logo
  );

  return result;
};

export const createCustomOffer = async (payload) => {
  const {
    deliveryDateString,
    deliveryDateUTC,
    totalPrice,
    totalRevision,
    customFeatures,
    thumbnail,
    category,
    messageId,
    userId,
    paymentIntentId,
  } = payload;

  const isOrderExist = await Order.findOne({
    transactionId: { $in: [paymentIntentId] },
  });

  if (isOrderExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order already created!");
  }

  const existingUser = await User.findOne({ userId });

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const { UTC, dateString } = dateFormatter.getDates();

  const orderId = await generateOrderId();
  const invoiceId = await generateInvoiceId();

  const newOrder = {
    user: existingUser._id,
    contactDetails: {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      phone: existingUser.phone,
      country: existingUser.country,
    },
    invoiceId: [invoiceId],
    orderId: orderId,
    userId: userId,
    category: category,
    paymentCurrency: paymentIntent.currency,
    paymentStatus: paymentIntent.status,
    email: existingUser.email,
    orderStatus: "in progress",
    orderType: "custom",
    thumbnail: thumbnail,
    additionalEmail: existingUser.email,
    transactionId: [paymentIntentId],
    customFeatures: customFeatures,
    referredImages: [],
    requirements: [],
    preferredDesigns: [],
    preferredColors: [],
    additionalFeature: [],
    additionalRevision: [],
    additionalDeliveryTime: [],
    additionalProgrammingLang: [],
    totalRevision: totalRevision,
    usedRevision: 0,
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
    name: `${existingUser.firstName} ${existingUser?.lastName}`,
    email: existingUser.email,
    phone: existingUser?.phone || "",
    country: existingUser?.country || "",
    packageTitle: "Custom Offer",
    type: "new",
    items: customFeatures.map((item) => ({
      label: item,
      value: item,
      price: 0,
    })),
    subtotal: totalPrice,
    packagePrice: 0,
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

  const message = await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        action: "accepted",
      },
    },
    { new: true }
  ).populate([
    {
      path: "conversationId",
      select: ["_id", "creator", "participant", "lastUpdated"],
    },
    {
      path: "sender",
      select: ["firstName", "lastName", "role", "userId", "photo"],
    },
    {
      path: "receiver",
      select: ["firstName", "lastName", "role", "userId", "photo"],
    },
  ]);

  const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
    message.receiver.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io.to(filteredSocketIds).emit("adminClientMsgTransfer", message);
  }

  const systemData = await System.findOne({ systemId: "system-1" });

  await sendOrderInvoiceToCustomer(
    newInvoice,
    createdOrder?.email,
    systemData.logo
  );

  return createdOrder;
};

export const createTemporaryCustomOrder = async (payload, userId) => {
  const {
    revisions,
    delivery,
    price,
    category,
    thumbnail,
    features,
    messageId,
    givenUserId,
  } = payload;

  if (givenUserId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "User ID doesn't match!");
  }

  const existingUser = await User.findOne({ userId: givenUserId });

  if (!existingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "User doesn't exist!");
  }

  const { UTC, dateString } = dateFormatter.getDates();

  const { deliveryDateUTC, deliveryDateString } = calculateDeliveryDate(
    delivery,
    []
  );

  const orderId = await generateOrderId();

  const newOrder = {
    user: existingUser._id,
    contactDetails: {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      phone: existingUser.phone,
      country: existingUser.country,
    },
    orderId: orderId,
    messageId: messageId,
    userId: userId,
    category: category,
    email: existingUser.email,
    orderStatus: "in progress",
    orderType: "custom",
    thumbnail: thumbnail,
    additionalEmail: existingUser.email,
    customFeatures: features,
    referredImages: [],
    requirements: [],
    preferredDesigns: [],
    preferredColors: [],
    additionalFeature: [],
    additionalRevision: [],
    additionalDeliveryTime: [],
    additionalProgrammingLang: [],
    totalRevision: revisions,
    usedRevision: 0,
    totalPrice: price,
    orderDateUTC: UTC,
    orderDateString: dateString,
    deliveryDateUTC: deliveryDateUTC,
    deliveryDateString: deliveryDateString,
    paymentDateString: dateString,
  };

  const createdOrder = await TemporaryOrder.create(newOrder);

  return {
    orderId: orderId,
    email: existingUser.email,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    price: price,
  };
};

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

  const folderPath = path.join(__dirname, "public", "image/upload");

  const processedImages = await Promise.all(
    referredImages.map(async (image) => {
      if (image.url.startsWith("data:image/")) {
        const filename = await saveBase64Image(image.url, folderPath);
        return filename;
      }
      return image;
    })
  );

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
    referredImages: processedImages,
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
