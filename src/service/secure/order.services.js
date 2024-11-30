import httpStatus from "http-status";
import mongoose from "mongoose";
import config from "../../config/index.js";
import { orderMessageSearchableFields } from "../../constant/order.constant.js";
import ApiError from "../../error/ApiError.js";
import { dateFormatter } from "../../helper/dateFormatter.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Invoice } from "../../model/invoice.model.js";
import {
  Order,
  OrderConversation,
  OrderMessage,
} from "../../model/order.model.js";
import { Package } from "../../model/package.model.js";
import { Review } from "../../model/review.model.js";
import { System } from "../../model/system.model.js";
import User from "../../model/user.model.js";
import { sendOrderInvoiceToCustomer } from "../../shared/nodeMailer.js";
import calculateAdditionalItemPrice from "../../utils/calculateAdditionalItemPrice.js";
import calculateDeliveryDate from "../../utils/calculateDeliveryDate.js";
import calculateRevisionCount from "../../utils/calculateRevisionCount.js";
import generateInvoiceId from "../../utils/generateInvoiceId.js";
import generateOrderId from "../../utils/generateOrderId.js";
import packagePriceConversion from "../../utils/packagePriceConversion.js";
import { getUsersFromAdminsAndClientsOnlineList } from "../../utils/socket.js";

const { ObjectId } = mongoose.Types;

const addReview = async (payload) => {
  const {
    orderId,
    reviewText,
    communicationRatings,
    serviceRatings,
    recommendedRatings,
    userId,
  } = payload;

  const existingOrder = await Order.findOne({ orderId });
  const existingUser = await User.findOne({ userId });

  const lastOrderMessage = await OrderMessage.findOne({
    order: existingOrder._id,
    isDelivered: true,
    action: "completed",
  });

  if (!existingOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found!");
  }

  const { UTC } = dateFormatter.getDates();

  const review = {
    user: existingUser._id,
    package: existingOrder.package,
    ratingPoints: Math.round(
      (communicationRatings + serviceRatings + recommendedRatings) / 3
    ),
    communicationRatings,
    serviceRatings,
    recommendedRatings,
    reviewText,
    productImageUrl: lastOrderMessage.attachment[0],
  };

  const createdReview = await Review.create(review);

  await Order.findOneAndUpdate({ orderId }, { $set: { isReviewed: true } });

  const { creator, participant } = await OrderConversation.findOne({
    _id: existingOrder.conversation,
  }).populate(["creator", "participant"]);

  const createdMessage = await OrderMessage.create({
    order: existingOrder._id,
    isRead: false,
    text: reviewText,
    dateTime: UTC,
    review: createdReview._id,
    sender: creator._id,
    receiver: participant._id,
    messageType: "order",
    isReview: true,
    conversation: existingOrder.conversation,
    attachment: [],
  });

  const message = await OrderMessage.findById(createdMessage._id).populate([
    {
      path: "conversation",
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
    {
      path: "review",
    },
    {
      path: "order",
      select: ["_id", "package", "orderStatus", "usedRevision"],
      populate: {
        path: "package",
        select: ["title", "thumbnail1"],
      },
    },
  ]);

  const flattenedMessage = {
    ...message.toObject(),
    package: message?.order?.package || null,
    order: {
      ...message.order.toObject(),
      package: undefined,
    },
  };

  const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
    creator?.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io
      .to(filteredSocketIds)
      .emit("adminClientOrderMsgTransfer", flattenedMessage);
  }

  return flattenedMessage;
};

const getOrderCount = async (userId) => {
  const completed = await Order.countDocuments({
    userId,
    orderStatus: "completed",
  });

  const progress = await Order.countDocuments({
    userId,
    orderStatus: "in progress",
  });

  const revision = await Order.countDocuments({
    userId,
    orderStatus: "revision",
  });

  return {
    completed,
    progress,
    revision,
  };
};

const addExtraFeatures = async (payload) => {
  const { transactionId, id, extraFeatures } = payload;

  const existingOrder = await Order.findById(id);
  const existingUser = await User.findOne({ userId: existingOrder.userId });
  const existingPackage = await Package.findOne({
    packageId: existingOrder.packageId,
  });

  if (!existingOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found!");
  }

  const totalExtraFeaturesCost = extraFeatures.reduce(
    (acc, feature) => acc + feature.price,
    0
  );

  const invoiceId = await generateInvoiceId();

  const result = await Order.findByIdAndUpdate(id, {
    $set: {
      additionalFeature: [...extraFeatures, ...existingOrder.additionalFeature],
      totalPrice: existingOrder.totalPrice + totalExtraFeaturesCost,
    },
    $push: {
      transactionId: { $each: [transactionId] },
      invoiceId: { $each: [invoiceId] },
    },
  });

  const { dateString } = dateFormatter.getDates();

  const newInvoice = {
    date: dateString,
    invoiceId: invoiceId,
    transactionId: transactionId,
    orderId: existingOrder.orderId,
    packageId: existingOrder.packageId,
    name: `${existingOrder.contactDetails?.firstName} ${existingOrder.contactDetails?.lastName}`,
    email: existingUser.email || existingOrder.additionalEmail,
    phone: existingOrder.contactDetails?.phone,
    country: existingOrder.contactDetails?.country,
    packageTitle: existingPackage?.title,
    type: "Add ons",
    items: [...extraFeatures],
    subtotal: totalExtraFeaturesCost,
    packagePrice: 0,
    total: totalExtraFeaturesCost,
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

const updateOrderMessageAction = async (payload) => {
  const { id, action } = payload;

  const existingMessage = await OrderMessage.findById(id);

  if (!existingMessage)
    throw new ApiError(httpStatus.BAD_REQUEST, "Message not found!");

  if (existingMessage.action) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already took action!");
  }

  await Order.findByIdAndUpdate(
    existingMessage.order,
    {
      $set: { orderStatus: action },
      $inc: { usedRevision: action === "revision" ? 1 : 0 },
    },
    { new: true }
  );

  const modifiedMessage = await OrderMessage.findByIdAndUpdate(
    id,
    {
      $set: { action },
    },
    { new: true }
  ).populate([
    {
      path: "conversation",
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
    {
      path: "order",
      select: ["_id", "package", "orderStatus", "usedRevision"],
      populate: {
        path: "package",
        select: ["title", "thumbnail1"],
      },
    },
  ]);

  const flattenedMessage = {
    ...modifiedMessage.toObject(),
    package: modifiedMessage?.order?.package || null,
    order: {
      ...modifiedMessage.order.toObject(),
      package: undefined,
    },
  };

  const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
    modifiedMessage.receiver.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io
      .to(filteredSocketIds)
      .emit("adminClientOrderMsgTransfer", flattenedMessage);
  }

  return flattenedMessage;
};

const getOrderUnreadMessages = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  filtersData["isRead"] = false;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: orderMessageSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => {
        if (field === "isRead") {
          return {
            [field]: value === "true" ? true : false,
          };
        }
        if (field.includes("messageType")) {
          const messageTypes = value.split(",");
          return {
            [field]: { $in: messageTypes },
          };
        }
        return {
          [field]: value,
        };
      }),
    });
  }

  const whereConditions = andCondition.length > 0 ? { $and: andCondition } : {};

  const { page, limit, skip, sortBy, sortOrder } =
    PaginationHelpers.calculationPagination(paginationOptions);

  const sortConditions = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const pipelines = [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    { $unwind: "$sender" },
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "_id",
        as: "receiver",
      },
    },
    { $unwind: "$receiver" },
    {
      $lookup: {
        from: "orderconversations",
        localField: "conversation",
        foreignField: "_id",
        as: "conversation",
      },
    },
    { $unwind: "$conversation" },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    {
      $lookup: {
        from: "packages",
        localField: "order.package",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    {
      $project: {
        "sender.userId": 1,
        "sender.firstName": 1,
        "sender.lastName": 1,
        "sender.photo": 1,
        "sender.role": 1,
        "receiver.userId": 1,
        "receiver.firstName": 1,
        "receiver.lastName": 1,
        "receiver.photo": 1,
        "receiver.role": 1,
        "conversation._id": 1,
        "conversation.creator": 1,
        "conversation.participant": 1,
        "conversation.lastUpdated": 1,
        "order._id": 1,
        "package.title": 1,
        "package.thumbnail1": 1,
        text: 1,
        attachment: 1,
        isRead: 1,
        dateTime: 1,
        createdAt: 1,
        messageType: 1,
      },
    },
    { $match: whereConditions },
    { $sort: sortConditions },
  ];

  const result = await OrderMessage.aggregate(pipelines);

  return {
    meta: {
      page,
      limit,
      totalDocs: result.length,
    },
    data: result,
  };
};

const sendOrderMessage = async (payload) => {
  const { UTC } = dateFormatter.getDates();

  const { text, conversationId, attachment } = payload;

  const {
    order,
    creator,
    participant,
    _id,
    lastUpdated,
    attachments = [],
    links = [],
  } = await OrderConversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

  const result = await OrderMessage.create({
    order,
    isRead: false,
    text,
    dateTime: UTC,
    sender: creator._id,
    receiver: participant._id,
    messageType: "order",
    conversation: conversationId,
    attachment,
  });

  let urls = [];

  if (text) {
    const urlRegex = /(?<=\s|^)(https?:\/\/[^\s,]+|www\.[^\s,]+)(?=\s|,|$)/g;

    function extractUrls(text) {
      return (text.match(urlRegex) || []).map((url) => url.trim());
    }

    urls = extractUrls(text);
  }

  await OrderConversation.findOneAndUpdate(
    {
      _id: conversationId,
    },
    {
      $set: {
        attachments: [...attachment, ...attachments],
        links: [...urls, ...links],
        lastUpdated: UTC,
      },
    }
  );

  const message = await OrderMessage.findById(result._id).populate([
    {
      path: "conversation",
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
    {
      path: "order",
      select: ["_id", "package", "orderStatus"],
      populate: {
        path: "package",
        select: ["title", "thumbnail1"],
      },
    },
  ]);

  const flattenedMessage = {
    ...message.toObject(),
    package: message?.order?.package || null,
    order: {
      ...message.order.toObject(),
      package: undefined,
    },
  };

  const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
    creator?.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io
      .to(filteredSocketIds)
      .emit("adminClientOrderMsgTransfer", flattenedMessage);
  }

  return flattenedMessage;
};

const getOrderMessages = async (filters, paginationOptions) => {
  const { order, ...filtersData } = filters;

  const orderConversation = await OrderConversation.findOne({
    order: order,
  }).populate([
    {
      path: "creator",
      model: "User",
      select: "-password -token",
    },
    {
      path: "participant",
      model: "User",
      select: "-password -token",
    },
  ]);

  const pipelines = [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    { $unwind: "$sender" },
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "_id",
        as: "receiver",
      },
    },
    { $unwind: "$receiver" },
    {
      $lookup: {
        from: "orderconversations",
        localField: "conversation",
        foreignField: "_id",
        as: "conversation",
      },
    },
    { $unwind: "$conversation" },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    {
      $lookup: {
        from: "packages",
        localField: "order.package",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    {
      $lookup: {
        from: "reviews",
        localField: "review",
        foreignField: "_id",
        as: "review",
      },
    },
    { $unwind: { path: "$review", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        "sender.userId": 1,
        "sender.firstName": 1,
        "sender.lastName": 1,
        "sender.photo": 1,
        "sender.role": 1,
        "receiver.userId": 1,
        "receiver.firstName": 1,
        "receiver.lastName": 1,
        "receiver.photo": 1,
        "receiver.role": 1,
        "conversation._id": 1,
        "conversation.creator": 1,
        "conversation.participant": 1,
        "conversation.lastUpdated": 1,
        "order._id": 1,
        "package.title": 1,
        "package.thumbnail1": 1,
        "review.ratingPoints": 1,
        "review.communicationRatings": 1,
        "review.serviceRatings": 1,
        "review.recommendedRatings": 1,
        "review.productImageUrl": 1,
        text: 1,
        isDelivered: 1,
        isReview: 1,
        action: 1,
        attachment: 1,
        isRead: 1,
        dateTime: 1,
        createdAt: 1,
        messageType: 1,
      },
    },
    {
      $match: { "conversation._id": new ObjectId(orderConversation?._id) },
    },
  ];

  const { page, limit, sortBy, sortOrder } =
    PaginationHelpers.calculationPagination(paginationOptions);

  const sortConditions = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const result = await OrderMessage.aggregatePaginate(pipelines, options);
  result.orderConversation = orderConversation;

  return result;
};

const getOrderList = async (paginationOptions, userId) => {
  const { page, limit, sortBy, sortOrder } =
    PaginationHelpers.calculationPagination(paginationOptions);

  const sortConditions = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const pipelines = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "packages",
        localField: "package",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    {
      $lookup: {
        from: "orderconversations",
        localField: "conversation",
        foreignField: "_id",
        as: "conversation",
      },
    },
    { $unwind: "$conversation" },
    {
      $unset: [
        "user.password",
        "user.blockStatus",
        "user.role",
        "user.createdAt",
        "user.updatedAt",
        "user.__v",
        "user._id",
        "package._id",
        "package.__v",
        "package.createdAt",
        "package.updatedAt",
      ],
    },
    {
      $match: { userId },
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const result = await Order.aggregatePaginate(pipelines, options);

  const { docs, totalDocs } = result;

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

const getOneOrder = async (id, userId) => {
  const result = await Order.findOne({ _id: id, userId: userId }).populate([
    { path: "package" },
    { path: "user", select: ["-password", "-role"] },
  ]);

  if (!result) throw new ApiError(httpStatus.BAD_REQUEST, "Order not found!");

  return result;
};

const orderSubmission = async (payload, userId) => {
  const {
    userId: givenUserId,
    packageId,
    category,
    transactionId,
    paymentCurrency,
    paymentStatus,
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
    paymentCurrency: paymentCurrency,
    paymentStatus: paymentStatus,
    email: existingUser.email,
    orderStatus: "in progress",
    additionalEmail: additionalEmail,
    transactionId: [transactionId],
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
    transactionId: transactionId,
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
  // await sendOrderDetailsToAdmin(createdOrder);

  return createdOrder;
};

export const OrderService = {
  addReview,
  getOrderCount,
  addExtraFeatures,
  updateOrderMessageAction,
  getOrderUnreadMessages,
  sendOrderMessage,
  getOrderMessages,
  getOrderList,
  getOneOrder,
  orderSubmission,
};
