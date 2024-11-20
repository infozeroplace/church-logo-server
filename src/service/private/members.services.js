import httpStatus from "http-status";
import { membersSearchableFields } from "../../constant/members.constants.js";
import ApiError from "../../error/ApiError.js";
import { dateFormatter } from "../../helper/dateFormatter.js";
import getDateRange from "../../helper/getDateRange.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Conversation, Message } from "../../model/chat.model.js";
import { Task } from "../../model/task.model.js";
import User from "../../model/user.model.js";
import { generateUserId } from "../../utils/generateUserId.js";

const getTaskCounts = async (userId) => {
  const inProgressTasks = await Task.countDocuments({
    status: "inprogress",
    assignedTo: { $in: userId },
  });
  const completedTasks = await Task.countDocuments({
    status: "completed",
    assignedTo: { $in: userId },
  });

  const totalTasks = inProgressTasks + completedTasks;

  return {
    totalTasks,
    inProgressTasks,
    completedTasks,
  };
};

const addModerator = async (payload) => {
  const isEmailExist = await User.findOne({ email: payload.email });

  if (isEmailExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exists with this email"
    );
  }

  function determineMessageType(adminRole, newUserRole) {
    switch (adminRole) {
      case "super_admin":
        return newUserRole === "admin"
          ? "super-admin-admin"
          : "super-admin-moderator";

      case "admin":
        return newUserRole === "admin" ? "admin-admin" : "admin-moderator";

      case "moderator":
        return newUserRole === "moderator"
          ? "moderator-moderator"
          : "admin-moderator";

      default:
        return null;
    }
  }

  const admins = await User.find({
    role: { $in: ["super_admin", "admin", "moderator"] },
  }).select(["_id", "role"]);

  const userId = await generateUserId();
  payload.userId = userId;

  const createdUser = await User.create(payload);

  const { UTC, dateString } = dateFormatter.getDates();

  // Prepare conversation and message data for batch insert
  const conversations = [];
  const messages = [];

  for (const u of admins) {
    const messageType = determineMessageType(u.role, payload.role);

    const newConversation = {
      creator: createdUser._id,
      participant: u._id,
      lastUpdated: UTC,
      messageType,
    };

    conversations.push(newConversation);
  }

  // Bulk insert conversations
  const createdConversations = await Conversation.insertMany(conversations);

  // Prepare messages for all conversations
  createdConversations.forEach((conversation, index) => {
    messages.push({
      isRead: true,
      text: "No messages",
      dateTime: UTC,
      sender: createdUser._id,
      receiver: conversation.participant,
      conversationId: conversation._id,
      attachment: [],
      messageType: conversation.messageType,
    });
  });

  // Bulk insert messages
  const createdMessages = await Message.insertMany(messages);

  // Update conversations with the last message ID in bulk
  const updates = createdMessages.map((msg, index) => ({
    updateOne: {
      filter: { _id: createdConversations[index]._id },
      update: { lastMessage: msg._id },
    },
  }));

  await Conversation.bulkWrite(updates);

  return createdUser;
};

const updateStatus = async (id) => {
  const existingUser = await User.findOne({ _id: id });

  const result = await User.findOneAndUpdate(
    { _id: id },
    { blockStatus: !existingUser?.blockStatus }
  );

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteUsers = async (ids) => {
  const result = await User.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteOneUser = async (id) => {
  const result = await User.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const getUserList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: membersSearchableFields.map((field) => ({
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
        if (field === "date") {
          const dates = value.split(",");
          return {
            [field]: { $in: getDateRange(dates[0], dates[1]) },
          };
        } else if (field === "country") {
          const countries = value.split(",");
          return {
            [field]: { $in: countries },
          };
        } else if (field === "blockStatus") {
          const statuses = value.split(",");
          return {
            [field]: {
              $in: statuses.map((bs) => (bs === "true" ? true : false)),
            },
          };
        } else {
          return {
            [field]: value,
          };
        }
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
      $unset: ["password"],
    },
    {
      $match: whereConditions,
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },
    {
      $project: {
        password: 0,
        "orders.password": 0,
      },
    },
    {
      $sort: sortConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const { docs, totalDocs } = await User.aggregatePaginate(pipelines, options);

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

const getAllModerator = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: membersSearchableFields.map((field) => ({
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
        if (field === "date") {
          const dates = value.split(",");
          return {
            [field]: { $in: getDateRange(dates[0], dates[1]) },
          };
        } else if (field === "country") {
          const countries = value.split(",");
          return {
            [field]: { $in: countries },
          };
        } else if (field === "blockStatus") {
          const statuses = value.split(",");
          return {
            [field]: {
              $in: statuses.map((bs) => (bs === "true" ? true : false)),
            },
          };
        } else {
          return {
            [field]: value,
          };
        }
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
      $unset: ["password"],
    },
    {
      $match: whereConditions,
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },
    {
      $project: {
        password: 0,
        "orders.password": 0,
      },
    },
    {
      $sort: sortConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const result = await User.aggregate(pipelines, options);

  return result;
};

export const MembersService = {
  getTaskCounts,
  addModerator,
  updateStatus,
  deleteUsers,
  deleteOneUser,
  getUserList,
  getAllModerator,
};
