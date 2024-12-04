import httpStatus from "http-status";
import { orderMessageFilterableField } from "../../constant/order.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { OrderService } from "../../service/secure/order.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const submitCustomOffer = catchAsync(async (req, res) => {
  const { ...payload } = req.body;
  const userId = req.user.userId;

  const result = await OrderService.submitCustomOffer(payload, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Added successfully!",
    meta: null,
    data: result,
  });
});

const addReview = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const finalPayload = {
    ...req.body,
    userId,
  };

  const result = await OrderService.addReview(finalPayload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review added successfully!",
    meta: null,
    data: result,
  });
});

const getOrderCount = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await OrderService.getOrderCount(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order counts retrieved successfully!",
    meta: null,
    data: result,
  });
});

const addExtraFeatures = catchAsync(async (req, res) => {
  const { ...payload } = req.body;

  const result = await OrderService.addExtraFeatures(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Added successfully!",
    meta: null,
    data: result,
  });
});

const updateOrderMessageAction = catchAsync(async (req, res) => {
  const { ...message } = req.body;

  const result = await OrderService.updateOrderMessageAction(message);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message added successfully!",
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

  const paginationOptions = pick(req.query, paginationFields);

  const result = await OrderService.getOrderMessages(
    filters,
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

const getOrderList = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await OrderService.getOrderList(
    paginationOptions,
    userId
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order list retrieved successfully!",
    meta,
    data,
  });
});

const getOneOrder = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const result = await OrderService.getOneOrder(id, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully!",
    meta: null,
    data: result,
  });
});

const orderSubmission = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ...payload } = req.body;

  const result = await OrderService.orderSubmission(payload, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order has been submitted!",
    meta: null,
    data: result,
  });
});

export const OrderController = {
  submitCustomOffer,
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
