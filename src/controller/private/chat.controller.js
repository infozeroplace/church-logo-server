import httpStatus from "http-status";
import {
  conversationFilterableField,
  messageFilterableField,
} from "../../constant/chat.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { ChatService } from "../../service/private/chat.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getConversationInfo = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ChatService.getConversationInfo(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation retrieved successfully!",
    meta: null,
    data: result,
  });
});

const getUnreadMessages = catchAsync(async (req, res) => {
  const filters = pick(req.query, messageFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await ChatService.getUnreadMessages(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Unread message retrieved successfully!",
    meta,
    data,
  });
});

const sendAdminMessage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ...message } = req.body;

  const result = await ChatService.sendAdminMessage(message, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message added successfully!",
    meta: null,
    data: result,
  });
});

const sendMessage = catchAsync(async (req, res) => {
  const { ...message } = req.body;

  const result = await ChatService.sendMessage(message);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message added successfully!",
    meta: null,
    data: result,
  });
});

const getAdminMessages = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const filters = pick(req.query, messageFilterableField);
  const additionalFilters = {
    ...filters,
    userId,
  };

  const paginationOptions = pick(req.query, paginationFields);

  const result = await ChatService.getAdminMessages(
    additionalFilters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully!",
    meta: null,
    data: result,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const filters = pick(req.query, messageFilterableField);
  const additionalFilters = {
    ...filters,
    userId,
  };

  const paginationOptions = pick(req.query, paginationFields);

  const result = await ChatService.getMessages(
    additionalFilters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully!",
    meta: null,
    data: result,
  });
});

const getInbox = catchAsync(async (req, res) => {
  const filters = pick(req.query, conversationFilterableField);

  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await ChatService.getInbox(filters, paginationOptions);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation retrieved successfully!",
    meta,
    data,
  });
});

export const ChatController = {
  getConversationInfo,
  getUnreadMessages,
  sendAdminMessage,
  sendMessage,
  getAdminMessages,
  getMessages,
  getInbox,
};
