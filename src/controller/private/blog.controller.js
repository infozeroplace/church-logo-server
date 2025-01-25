import httpStatus from "http-status";
import { blogFilterableField } from "../../constant/blog.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { BlogService } from "../../service/private/blog.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const uploadBlogImage = catchAsync(async (req, res) => {
  const { ...file } = req.file;

  const result = await BlogService.uploadBlogImage(file);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog image added successfully",
    meta: null,
    data: result,
  });
});

const editBlog = catchAsync(async (req, res) => {
  const result = await BlogService.editBlog(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog edited successfully",
    meta: null,
    data: null,
  });
});

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

const deleteBlogs = catchAsync(async (req, res) => {
  const result = await BlogService.deleteBlogs(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogService.deleteBlog(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog deleted successfully",
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

const addBlog = catchAsync(async (req, res) => {
  const result = await BlogService.addBlog(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog added successfully!",
    meta: null,
    data: result,
  });
});

export const BlogController = {
  uploadBlogImage,
  editBlog,
  blog,
  deleteBlogs,
  deleteBlog,
  blogList,
  addBlog,
};
