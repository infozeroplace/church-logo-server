import httpStatus from "http-status";
import { taskSearchableFields } from "../../constant/task.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Order } from "../../model/order.model.js";
import { Task } from "../../model/task.model.js";
import User from "../../model/user.model.js";
import generateTaskId from "../../utils/generateTaskId.js";
import { getTaskCommentators } from "../../utils/socket.js";

const addComment = async (payload, role) => {
  const existingTask = await Task.findOne({ taskId: payload.taskId });

  if (!existingTask) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Task not found");
  }

  if (existingTask.status === "completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Task has been closed");
  }

  if (
    role === "moderator" &&
    !existingTask.assignedTo.includes(payload.userId)
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");
  }

  let urls = [];

  if (payload.text) {
    const urlRegex = /(?<=\s|^)(https?:\/\/[^\s,]+|www\.[^\s,]+)(?=\s|,|$)/g;

    function extractUrls(text) {
      return (text.match(urlRegex) || []).map((url) => url.trim());
    }

    urls = extractUrls(payload.text);
  }

  const today = new Date();

  payload.dateTime = today.toISOString();

  const result = await Task.findOneAndUpdate(
    { taskId: payload.taskId },
    {
      $set: { links: [...urls, ...(existingTask.links || [])] },
      $push: {
        comments: payload,
      },
    },
    { new: true }
  ).populate([
    {
      path: "creator",
      model: "User",
      select: "firstName lastName photo role userId",
    },
    {
      path: "comments.user",
      model: "User",
      select: "firstName lastName photo role userId",
    },
  ]);

  const { filteredSocketIds } = getTaskCommentators(existingTask.assignedTo);

  if (filteredSocketIds.length > 0) {
    global.io.to(filteredSocketIds).emit("taskCommentTransfer", result);
  }

  return result;
};

const updateTask = async (payload) => {
  const { _id } = payload;

  const result = await Task.findByIdAndUpdate(_id, payload);

  return result;
};

const getTask = async (id, userId, role) => {
  const result = await Task.findById(id).populate([
    {
      path: "creator",
      model: "User",
      select: "firstName lastName photo role userId",
    },
    {
      path: "comments.user",
      model: "User",
      select: "firstName lastName photo role userId",
    },
  ]);

  if (role === "moderator" && !result.assignedTo.includes(userId))
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");

  return result;
};

const deleteTasks = async (ids) => {
  const result = await Task.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteTask = async (id) => {
  const result = await Task.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const getTaskList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: taskSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const filterHandlers = {
      userId: (value) => {
        return {
          assignedTo: {
            $in: [value],
          },
        };
      },
      status: (value) => {
        const statuses = value.split(",");
        return {
          status: {
            $in: statuses,
          },
        };
      },
      priority: (value) => {
        const priorities = value.split(",");
        return {
          priority: {
            $in: priorities,
          },
        };
      },
      category: (value) => {
        const categories = value.split(",");
        return {
          category: {
            $in: categories,
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
      $match: whereConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const { docs, totalDocs } = await Task.aggregatePaginate(pipelines, options);

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

const createTask = async (payload, userId) => {
  const existingOrder = await Order.findOne({ orderId: payload.orderId });

  if (!existingOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
  }

  const existingUser = await User.findOne({ userId: userId });

  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Creator not found");
  }

  payload.taskId = await generateTaskId();
  payload.creator = existingUser._id;
  payload.deadline = new Date(payload.deadline).toISOString();

  const result = await Task.create(payload);

  return result;
};

export const TaskService = {
  addComment,
  updateTask,
  getTask,
  deleteTasks,
  deleteTask,
  getTaskList,
  createTask,
};
