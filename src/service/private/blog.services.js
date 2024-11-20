import httpStatus from "http-status";
import { blogSearchableFields } from "../../constant/blog.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import cloudinary from "../../middleware/cloudinary.js";
import { Blog } from "../../model/blog.model.js";

const uploadBlogImage = async (payload) => {
  if (!payload.path) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image not found!");
  }

  const { path } = payload;
  const result = await cloudinary.v2.uploader.upload(path, {
    folder: "church-logo/blog-images",
    use_filename: true,
  });

  return result;
};

const editBlog = async (payload, file) => {
  const { id, ...data } = payload;

  if (file && file.path) {
    const result = await cloudinary.v2.uploader.upload(thumbnail.path, {
      folder: "church-logo/blog-images",
      use_filename: true,
    });

    payload.thumbnail = result.secure_url;
  }

  const result = await Blog.findOneAndUpdate(
    { _id: id },
    { $set: { ...data } },
    { new: true, upsert: true }
  );

  return result;
};

const blog = async (id) => {
  const result = await Blog.findOne({ _id: id });

  if (!result) throw new ApiError(httpStatus.BAD_REQUEST, "Blog not found!");

  return result;
};

const deleteBlogs = async (ids) => {
  for (const id of ids) {
    const existingBlog = await Blog.findOne({ _id: id });
    if (existingBlog?.thumbnail?.publicId) {
      await cloudinary.v2.uploader.destroy(existingBlog?.thumbnail?.publicId);
    }

    if (existingBlog?.images?.length > 0) {
      for (const item of existingBlog?.images) {
        await cloudinary.v2.uploader.destroy(item?.publicId);
      }
    }
  }

  const result = await Blog.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteBlog = async (id) => {
  const existingBlog = await Blog.findOne({ _id: id });

  if (existingBlog?.thumbnail?.publicId) {
    await cloudinary.v2.uploader.destroy(existingBlog?.thumbnail?.publicId);
  }

  if (existingBlog?.images?.length > 0) {
    for (const item of existingBlog?.images) {
      await cloudinary.v2.uploader.destroy(item?.publicId);
    }
  }

  const result = await Blog.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const blogList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: blogSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions = andCondition.length > 0 ? { $and: andCondition } : {};

  const { page, limit, sortBy, sortOrder } =
    PaginationHelpers.calculationPagination(paginationOptions);

  const sortConditions = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const pipelines = [
    {
      $match: whereConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const { docs, totalDocs } = await Blog.aggregatePaginate(pipelines, options);

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

const addBlog = async (payload) => {
  const { thumbnail, ...data } = payload;

  if (thumbnail && thumbnail.path) {
    const result = await cloudinary.v2.uploader.upload(thumbnail.path, {
      folder: "church-logo/blog-images",
      use_filename: true,
    });

    data.thumbnail = result.secure_url;
  }

  const result = await Blog.create(data);

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

export const BlogService = {
  uploadBlogImage,
  editBlog,
  blog,
  deleteBlogs,
  deleteBlog,
  blogList,
  addBlog,
};
