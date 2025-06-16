import httpStatus from "http-status";
import mongoose from "mongoose";
import {
  conversationSearchableFields,
  messageSearchableFields,
} from "../../constant/chat.constant.js";
import ApiError from "../../error/ApiError.js";
import { dateFormatter } from "../../helper/dateFormatter.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Conversation, Message } from "../../model/chat.model.js";
import { Order } from "../../model/order.model.js";
import User from "../../model/user.model.js";
import { sendMessageToUserEmail } from "../../shared/nodeMailer.js";
import {
  getUsersFromAdminsAndClientsOnlineList,
  getUsersFromAdminsOnlineList,
} from "../../utils/socket.js";

const { ObjectId } = mongoose.Types;

const getConversationInfo = async (id) => {
  const conversation = await Conversation.findById(id).populate([
    {
      path: "creator",
      model: "User",
      select: "firstName lastName photo role userId",
    },
  ]);

  if (!conversation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");
  }

  const totalOrders = await Order.countDocuments({
    userId: conversation.creator.userId,
  });
  const completedOrders = await Order.countDocuments({
    userId: conversation.creator.userId,
    orderStatus: "completed",
  });
  const inProgressOrders = await Order.countDocuments({
    userId: conversation.creator.userId,
    orderStatus: "in progress",
  });
  const revisionsOrders = await Order.countDocuments({
    userId: conversation.creator.userId,
    orderStatus: "revision",
  });
  const deliveredOrders = await Order.countDocuments({
    userId: conversation.creator.userId,
    orderStatus: "delivered",
  });

  const orderCounts = {
    totalOrders,
    completedOrders,
    inProgressOrders,
    revisionsOrders,
    deliveredOrders,
  };

  return {
    ...conversation.toObject(),
    orderCounts,
  };
};

const getUnreadMessages = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  filtersData["isRead"] = false;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: messageSearchableFields.map((field) => ({
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
        from: "conversations",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversationId",
      },
    },
    { $unwind: "$conversationId" },
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
        "conversationId._id": 1,
        "conversationId.creator": 1,
        "conversationId.participant": 1,
        "conversationId.lastUpdated": 1,
        text: 1,
        attachment: 1,
        isRead: 1,
        dateTime: 1,
        createdAt: 1,
        messageType: 1,
        isCustomOffer: 1,
        customOffer: 1,
        action: 1,
      },
    },
    { $match: whereConditions },
    { $sort: sortConditions },
  ];

  const result = await Message.aggregate(pipelines);

  return {
    meta: {
      page,
      limit,
      totalDocs: result.length,
    },
    data: result,
  };
};

const sendAdminMessage = async (payload, userId) => {
  const { UTC } = dateFormatter.getDates();

  const { text, conversationId, attachment, messageType } = payload;

  let senderId = null;
  let receiverId = null;

  const {
    creator,
    participant,
    _id,
    lastUpdated,
    attachments = [],
    links = [],
  } = await Conversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

  if (creator.userId === userId) {
    senderId = creator._id;
    receiverId = participant._id;
  } else if (participant.userId === userId) {
    senderId = participant._id;
    receiverId = creator._id;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Action denied");
  }

  const sender = await User.findOne({ _id: senderId }).select(["userId"]);
  const receiver = await User.findOne({ _id: receiverId }).select(["userId"]);

  const result = await Message.create({
    isRead: false,
    text,
    dateTime: UTC,
    sender: senderId,
    receiver: receiverId,
    conversationId,
    messageType,
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

  await Conversation.findOneAndUpdate(
    {
      _id: conversationId,
    },
    {
      $set: {
        attachments: [...attachment, ...attachments],
        links: [...urls, ...links],
        lastMessage: result._id,
        lastUpdated: UTC,
      },
    }
  );

  const message = await Message.findById(result._id).populate([
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

  const { filteredSocketIds } = getUsersFromAdminsOnlineList(
    sender.userId,
    receiver.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io.to(filteredSocketIds).emit("adminMsgTransfer", message);
  }

  return message;
};

const sendMessage = async (payload) => {
  const { UTC } = dateFormatter.getDates();

  const { conversationId, isCustomOffer } = payload;

  const {
    creator,
    participant,
    _id,
    lastUpdated,
    attachments = [],
    links = [],
  } = await Conversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

  if (isCustomOffer) {
    const {
      description,
      revisions,
      delivery,
      price,
      category,
      offerType,
      thumbnail,
      features,
    } = payload;

    const result = await Message.create({
      isCustomOffer,
      customOffer: {
        revisions,
        delivery,
        price,
        category,
        offerType,
        thumbnail,
        features,
      },
      text: description,
      dateTime: UTC,
      sender: participant._id,
      receiver: creator._id,
      messageType: "client",
      conversationId,
      attachment: [],
    });

    await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
      },
      {
        $set: {
          lastMessage: result._id,
          lastUpdated: UTC,
        },
      }
    );

    const message = await Message.findById(result._id).populate([
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

    const { filteredOnlineUsers, filteredSocketIds } =
      getUsersFromAdminsAndClientsOnlineList(creator?.userId);

    if (filteredSocketIds.length > 0) {
      global.io.to(filteredSocketIds).emit("adminClientMsgTransfer", message);
    }

    if (!filteredOnlineUsers.some((u) => u.userId === creator?.userId)) {
      await sendMessageToUserEmail(creator, message);
    }

    return message;
  } else {
    const { text, attachment } = payload;

    const result = await Message.create({
      text,
      dateTime: UTC,
      sender: participant._id,
      receiver: creator._id,
      messageType: "client",
      conversationId,
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

    await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
      },
      {
        $set: {
          attachments: [...attachment, ...attachments],
          links: [...urls, ...links],
          lastMessage: result._id,
          lastUpdated: UTC,
        },
      }
    );

    const message = await Message.findById(result._id).populate([
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

    const { filteredOnlineUsers, filteredSocketIds } =
      getUsersFromAdminsAndClientsOnlineList(creator?.userId);

    if (filteredSocketIds.length > 0) {
      global.io.to(filteredSocketIds).emit("adminClientMsgTransfer", message);
    }

    if (!filteredOnlineUsers.some((u) => u.userId === creator?.userId)) {
      await sendMessageToUserEmail(creator, message);
    }

    return message;
  }
};

const getAdminMessages = async (filters, paginationOptions) => {
  const { conversationId, userId, ...filtersData } = filters;

  const { creator, participant, messageType } = await Conversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

  let participantId = null;
  let participantName = null;

  if (creator.userId !== userId) {
    participantId = creator.userId;
    participantName = `${creator.firstName} ${creator.lastName}`;
  } else {
    participantId = participant.userId;
    participantName = `${participant.firstName} ${participant.lastName}`;
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
        from: "conversations",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversationId",
      },
    },
    { $unwind: "$conversationId" },
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
        "conversationId._id": 1,
        "conversationId.creator": 1,
        "conversationId.participant": 1,
        "conversationId.lastUpdated": 1,
        text: 1,
        attachment: 1,
        isRead: 1,
        dateTime: 1,
        createdAt: 1,
        messageType: 1,
      },
    },
    {
      $match: { "conversationId._id": new ObjectId(conversationId) },
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

  const result = await Message.aggregatePaginate(pipelines, options);
  result.participantId = participantId;
  result.participantName = participantName;
  result.messageType = messageType;

  return result;
};

const getMessages = async (filters, paginationOptions) => {
  const { conversationId, userId, ...filtersData } = filters;

  const { creator, participant } = await Conversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

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
        from: "conversations",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversationId",
      },
    },
    { $unwind: "$conversationId" },
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
        "conversationId._id": 1,
        "conversationId.creator": 1,
        "conversationId.participant": 1,
        "conversationId.lastUpdated": 1,
        text: 1,
        attachment: 1,
        isRead: 1,
        dateTime: 1,
        createdAt: 1,
        messageType: 1,
        isCustomOffer: 1,
        customOffer: 1,
        action: 1,
      },
    },
    {
      $match: { "conversationId._id": new ObjectId(conversationId) },
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

  const result = await Message.aggregatePaginate(pipelines, options);
  result.participantId = creator?.userId;
  result.participantName = `${creator.firstName} ${creator.lastName}`;

  return result;
};

const getInbox = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: conversationSearchableFields.map((field) => {
        // Check if we are dealing with firstName + lastName concatenation
        if (field.includes("firstName") || field.includes("lastName")) {
          const baseField = field.split(".")[0]; // get 'creator' or 'participant'

          return {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [
                    `$${baseField}.firstName`,
                    " ",
                    `$${baseField}.lastName`,
                  ],
                },
                regex: searchTerm,
                options: "i",
              },
            },
          };
        }

        // Default case for other searchable fields
        return {
          [field]: {
            $regex: searchTerm,
            $options: "i",
          },
        };
      }),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => {
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
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: "$creator" },
    {
      $lookup: {
        from: "users",
        localField: "participant",
        foreignField: "_id",
        as: "participant",
      },
    },
    { $unwind: "$participant" },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.sender",
        foreignField: "_id",
        as: "lastMessage.senderDetails",
      },
    },
    {
      $unwind: {
        path: "$lastMessage.senderDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "creator.userId": 1,
        "creator.role": 1,
        "creator.photo": 1,
        "creator.firstName": 1,
        "creator.lastName": 1,
        "participant.userId": 1,
        "participant.role": 1,
        "participant.photo": 1,
        "participant.firstName": 1,
        "participant.lastName": 1,
        "lastMessage.text": 1,
        "lastMessage.attachment": 1,
        "lastMessage.senderDetails.role": 1,
        "lastMessage.senderDetails.userId": 1,
        lastUpdated: 1,
        messageType: 1,
      },
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

  const { docs, totalDocs } = await Conversation.aggregatePaginate(
    pipelines,
    options
  );

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

export const ChatService = {
  getConversationInfo,
  getUnreadMessages,
  sendAdminMessage,
  sendMessage,
  getAdminMessages,
  getMessages,
  getInbox,
};
