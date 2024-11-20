import httpStatus from "http-status";
import mongoose from "mongoose";
import {
  orderMessageSearchableFields,
  orderSearchableFields,
} from "../../constant/order.constant.js";
import ApiError from "../../error/ApiError.js";
import { dateFormatter } from "../../helper/dateFormatter.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import {
  Order,
  OrderConversation,
  OrderMessage,
} from "../../model/order.model.js";
import { getUsersFromAdminsAndClientsOnlineList } from "../../utils/socket.js";

const { ObjectId } = mongoose.Types;

const getConversationInfo = async (id) => {
  const conversation = await OrderConversation.findById(id).populate([
    {
      path: "creator",
      model: "User",
      select: "firstName lastName photo role userId",
    },
  ]);

  if (!conversation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");
  }

  const existingOrder = await Order.findById(conversation.order);

  return {
    ...conversation.toObject(),
    orderStatus: existingOrder.orderStatus,
  };
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
        "order.orderStatus": 1,
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

  const { text, conversationId, attachment, isDelivered } = payload;

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

  const existingOrder = await Order.findById(order);

  if (!existingOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No order found!");
  }

  // if (existingOrder.orderStatus === "completed") {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "The order has closed!");
  // }

  if (isDelivered && existingOrder.orderStatus !== "delivered") {
    await Order.findByIdAndUpdate(
      { _id: order },
      { $set: { orderStatus: "delivered" } }
    );
  }

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

  const result = await OrderMessage.create({
    ...payload,
    order,
    isRead: false,
    dateTime: UTC,
    sender: participant._id,
    receiver: creator._id,
    conversation: conversationId,
  });

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
  const { conversation, userId, ...filtersData } = filters;

  const orderConversation = await OrderConversation.findOne({
    _id: conversation,
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
      $match: { "conversation._id": new ObjectId(conversation) },
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

const deleteOrders = async (ids) => {
  const result = await Order.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteOrder = async (id) => {
  const result = await Order.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const getOrder = async (id) => {
  const result = await Order.findById(id).populate(["user", "package"]);
  return result;
};

const getOrderList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: orderSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const filterHandlers = {
      category: (value) => {
        const categories = value.split(",");
        return {
          category: {
            $in: categories,
          },
        };
      },
      orderStatus: (value) => {
        const statuses = value.split(",");
        return {
          orderStatus: {
            $in: statuses,
          },
        };
      },
      default: (field, value) => ({
        [field]: value,
      }),
    };

    if (Object.keys(filtersData).length) {
      andCondition.push({
        $and: Object.entries(filtersData).map(([field, value]) => {
          const handler = filterHandlers[field] || filterHandlers.default;
          return handler(field === "default" ? [field, value] : value);
        }),
      });
    }
  }

  const whereConditions = andCondition.length > 0 ? { $and: andCondition } : {};

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
      $unset: ["password"],
    },
    {
      $match: whereConditions,
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

export const OrderService = {
  getConversationInfo,
  getOrderUnreadMessages,
  sendOrderMessage,
  getOrderMessages,
  deleteOrders,
  deleteOrder,
  getOrder,
  getOrderList,
};
