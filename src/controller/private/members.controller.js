import httpStatus from "http-status";
import { membersFilterableField } from "../../constant/members.constants.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { MembersService } from "../../service/private/members.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getTaskCounts = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await MembersService.getTaskCounts(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task counts retrieved successfully",
    meta: null,
    data: result,
  });
});

const addModerator = catchAsync(async (req, res) => {
  const { ...data } = req.body;
  const result = await MembersService.addModerator(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Moderator added successfully",
    meta: null,
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MembersService.updateStatus(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Status updated successfully",
    meta: null,
    data: result,
  });
});

const deleteUsers = catchAsync(async (req, res) => {
  const result = await MembersService.deleteUsers(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteOneUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MembersService.deleteOneUser(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    meta: null,
    data: result,
  });
});

const getUserList = catchAsync(async (req, res) => {
  const filters = pick(req.query, membersFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await MembersService.getUserList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer list retrieved successfully",
    meta,
    data,
  });
});

const getAllModerator = catchAsync(async (req, res) => {
  const filters = pick(req.query, membersFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await MembersService.getAllModerator(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved successfully",
    meta: null,
    data: result,
  });
});

export const MembersController = {
  getTaskCounts,
  addModerator,
  updateStatus,
  deleteUsers,
  deleteOneUser,
  getUserList,
  getAllModerator,
};
