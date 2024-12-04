import httpStatus from "http-status";
import { messageFilterableField } from "../../constant/chat.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { ChatService } from "../../service/secure/chat.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const updateCustomOfferMessageAction = catchAsync(async (req, res) => {
  const { ...message } = req.body;

  const result = await ChatService.updateCustomOfferMessageAction(message);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message added successfully!",
    meta: null,
    data: result,
  });
});

const getConversationId = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await ChatService.getConversationId(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation ID retrieved successfully!",
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

const getMessages = catchAsync(async (req, res) => {
  const filters = pick(req.query, messageFilterableField);

  const paginationOptions = pick(req.query, paginationFields);

  const result = await ChatService.getMessages(filters, paginationOptions);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully!",
    meta: null,
    data: result,
  });
});

const getInbox = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await ChatService.getInbox(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation retrieved successfully!",
    meta: null,
    data: result,
  });
});

export const ChatController = {
  updateCustomOfferMessageAction,
  getConversationId,
  getUnreadMessages,
  sendMessage,
  getMessages,
  getInbox,
};
