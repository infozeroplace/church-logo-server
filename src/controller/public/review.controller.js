import httpStatus from "http-status";
import { paginationFields } from "../../constant/pagination.constant.js";
import { reviewFilterableField } from "../../constant/review.constant.js";
import { ReviewService } from "../../service/public/review.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getReviewList = catchAsync(async (req, res) => {
  const filters = pick(req.query, reviewFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await ReviewService.getReviewList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    meta,
    data,
  });
});

export const ReviewController = {
  getReviewList,
};
