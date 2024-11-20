import httpStatus from "http-status";
import { blogFilterableField } from "../../constant/blog.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { BlogService } from "../../service/public/blog.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const blog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogService.blog(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog retrieved successfully",
    meta: null,
    data: result,
  });
});

const blogList = catchAsync(async (req, res) => {
  const filters = pick(req.query, blogFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await BlogService.blogList(filters, paginationOptions);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog list retrieved successfully",
    meta,
    data,
  });
});

export const BlogController = {
  blog,
  blogList,
};
