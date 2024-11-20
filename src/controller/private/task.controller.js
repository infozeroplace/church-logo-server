import httpStatus from "http-status";
import { paginationFields } from "../../constant/pagination.constant.js";
import { taskFilterableField } from "../../constant/task.constant.js";
import { TaskService } from "../../service/private/task.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const addComment = catchAsync(async (req, res) => {
  const role = req.user.role;
  const { ...data } = req.body;

  const result = await TaskService.addComment(data, role);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Added successfully",
    meta: null,
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await TaskService.updateTask(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully",
    meta: null,
    data: result,
  });
});

const getTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const result = await TaskService.getTask(id, userId, role);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved successfully",
    meta: null,
    data: result,
  });
});

const deleteTasks = catchAsync(async (req, res) => {
  const result = await TaskService.deleteTasks(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.deleteTask(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully",
    meta: null,
    data: result,
  });
});

const getTaskList = catchAsync(async (req, res) => {
  const filters = pick(req.query, taskFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await TaskService.getTaskList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task list retrieved successfully",
    meta,
    data,
  });
});

const createTask = catchAsync(async (req, res) => {
  const { ...data } = req.body;
  const userId = req.user.userId;

  const result = await TaskService.createTask(data, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task created successfully",
    meta: null,
    data: null,
  });
});

export const TaskController = {
  addComment,
  updateTask,
  getTask,
  deleteTasks,
  deleteTask,
  getTaskList,
  createTask,
};
