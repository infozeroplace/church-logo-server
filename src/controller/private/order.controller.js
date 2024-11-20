import httpStatus from "http-status";
import {
  orderFilterableField,
  orderMessageFilterableField,
} from "../../constant/order.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { OrderService } from "../../service/private/order.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getConversationInfo = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await OrderService.getConversationInfo(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation retrieved successfully!",
    meta: null,
    data: result,
  });
});

const getOrderUnreadMessages = catchAsync(async (req, res) => {
  const filters = pick(req.query, orderMessageFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await OrderService.getOrderUnreadMessages(
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

const sendOrderMessage = catchAsync(async (req, res) => {
  const { ...message } = req.body;

  const result = await OrderService.sendOrderMessage(message);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message added successfully!",
    meta: null,
    data: result,
  });
});

const getOrderMessages = catchAsync(async (req, res) => {
  const filters = pick(req.query, orderMessageFilterableField);
  const additionalFilters = {
    ...filters,
  };

  const paginationOptions = pick(req.query, paginationFields);

  const result = await OrderService.getOrderMessages(
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

const deleteOrders = catchAsync(async (req, res) => {
  const result = await OrderService.deleteOrders(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.deleteOrder(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    meta: null,
    data: result,
  });
});

const getOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.getOrder(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved successfully",
    meta: null,
    data: result,
  });
});

const getOrderList = catchAsync(async (req, res) => {
  const filters = pick(req.query, orderFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await OrderService.getOrderList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    meta,
    data,
  });
});

export const OrderController = {
  getConversationInfo,
  getOrderUnreadMessages,
  sendOrderMessage,
  getOrderMessages,
  deleteOrders,
  deleteOrder,
  getOrder,
  getOrderList,
};
