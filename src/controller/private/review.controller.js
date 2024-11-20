import httpStatus from "http-status";
import { paginationFields } from "../../constant/pagination.constant.js";
import { reviewFilterableField } from "../../constant/review.constant.js";
import { ReviewService } from "../../service/private/review.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const deleteReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReviews(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewService.deleteReview(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    meta: null,
    data: result,
  });
});

const updateReviewApproval = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewService.updateReviewApproval(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Status updated successfully",
    meta: null,
    data: result,
  });
});

const addReviewBulk = catchAsync(async (req, res) => {
  const result = await ReviewService.addReviewBulk(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews added successfully",
    meta: null,
    data: result,
  });
});

const addReview = catchAsync(async (req, res) => {
  const { ...reviewData } = req.body;

  const result = await ReviewService.addReview(reviewData);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review added successfully",
    meta: null,
    data: result,
  });
});

const getList = catchAsync(async (req, res) => {
  const filters = pick(req.query, reviewFilterableField);

  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await ReviewService.getList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "List retrieved successfully!",
    meta,
    data,
  });
});

export const ReviewController = {
  deleteReviews,
  deleteReview,
  updateReviewApproval,
  addReviewBulk,
  addReview,
  getList,
};
