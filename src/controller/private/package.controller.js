import httpStatus from "http-status";
import { packageFilterableField } from "../../constant/package.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { PackageService } from "../../service/private/package.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const deletePackages = catchAsync(async (req, res) => {

  const result = await PackageService.deletePackages(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages deleted successfully",
    meta: null,
    data: result,
  });
});

const deletePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PackageService.deletePackage(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package deleted successfully",
    meta: null,
    data: result,
  });
});

const getOnePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PackageService.getOnePackage(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package retrieved successfully",
    meta: null,
    data: result,
  });
});

const getPackageList = catchAsync(async (req, res) => {
  const filters = pick(req.query, packageFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await PackageService.getPackageList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages retrieved successfully",
    meta,
    data,
  });
});

const editPackage = catchAsync(async (req, res) => {
  const { ...payload } = req.body;

  const result = await PackageService.editPackage(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package edited successfully",
    meta: null,
    data: result,
  });
});

const addPackage = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const body = req.body;

  const payload = {
    ...body,
    createdBy: userId,
  };

  const result = await PackageService.addPackage(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package added successfully",
    meta: null,
    data: result,
  });
});

export const PackageController = {
  deletePackages,
  deletePackage,
  getOnePackage,
  getPackageList,
  editPackage,
  addPackage,
};
