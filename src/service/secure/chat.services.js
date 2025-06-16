import httpStatus from "http-status";
import mongoose from "mongoose";
import { messageSearchableFields } from "../../constant/chat.constant.js";
import ApiError from "../../error/ApiError.js";
import { dateFormatter } from "../../helper/dateFormatter.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Conversation, Message } from "../../model/chat.model.js";
import User from "../../model/user.model.js";
import { getUsersFromAdminsAndClientsOnlineList } from "../../utils/socket.js";

const { ObjectId } = mongoose.Types;

const updateCustomOfferMessageAction = async (payload) => {
  const { id, action } = payload;

  const existingMessage = await Message.findById(id);

  if (!existingMessage)
    throw new ApiError(httpStatus.BAD_REQUEST, "Message not found!");

  if (existingMessage.action) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already took action!");
  }

  const message = await Message.findByIdAndUpdate(
    id,
    {
      $set: { action },
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

  return message;
};

const getConversationId = async (userId) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED!");
  }

  const result = await Conversation.findOne({
    creator: user._id,
  });

  const stringId = result._id.toString();

  return stringId;
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

const sendMessage = async (payload, user) => {
  const { UTC } = dateFormatter.getDates();
  const { text, conversationId, attachment } = payload;

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

  if (creator.userId !== user.userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");
  }

  const result = await Message.create({
    isRead: false,
    text,
    dateTime: UTC,
    sender: creator._id,
    receiver: participant._id,
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

  const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
    creator?.userId
  );

  if (filteredSocketIds.length > 0) {
    global.io.to(filteredSocketIds).emit("adminClientMsgTransfer", message);
  }

  return message;
};

const getMessages = async (filters, paginationOptions, user) => {
  const { conversationId, ...filtersData } = filters;

  const { creator, participant } = await Conversation.findOne({
    _id: conversationId,
  }).populate(["creator", "participant"]);

  if (creator.userId !== user.userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");
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
  result.participantId = participant?.userId;
  result.participantName = `${participant.firstName} ${participant.lastName}`;

  return result;
};

const getInbox = async (userId) => {
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
        "creator.photo": 1,
        "creator.firstName": 1,
        "creator.lastName": 1,
        "participant.userId": 1,
        "participant.photo": 1,
        "participant.firstName": 1,
        "participant.lastName": 1,
        "lastMessage.text": 1,
        "lastMessage.attachment": 1,
        "lastMessage.senderDetails.role": 1,
        "lastMessage.senderDetails.userId": 1,
        attachments: 1,
        links: 1,
        lastUpdated: 1,
        messageType: 1,
      },
    },
    {
      $match: { "creator.userId": userId, messageType: "client" },
    },
  ];

  const result = await Conversation.aggregatePaginate(pipelines);

  return result;
};

export const ChatService = {
  updateCustomOfferMessageAction,
  getConversationId,
  getUnreadMessages,
  sendMessage,
  getMessages,
  getInbox,
};
