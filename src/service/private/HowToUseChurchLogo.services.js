import httpStatus from "http-status";
import { howToUseChurchLogoSearchableFields } from "../../constant/howToUseChurchLogo.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import cloudinary from "../../middleware/cloudinary.js";
import { HowToUseChurchLogo } from "../../model/howToUseChurchLogo.js";
import { removeImage } from "../../utils/fileSystem.js";
import generateHowToUseChurchLogoId from "../../utils/generateHowToUseChurchLogoId.js";

const addHowToUseChurchLogo = async (payload) => {
  const hId = await generateHowToUseChurchLogoId(payload);

  if (!hId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "H Id exists");
  }

  const result = await HowToUseChurchLogo.create({ hId, ...payload });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const uploadHowToUseChurchLogoImage = async (payload) => {
  if (!payload.path) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image not found!");
  }

  const { path } = payload;
  const result = await cloudinary.v2.uploader.upload(path, {
    folder: "church-logo/how-to-use-church-logo-thumbnails",
    use_filename: true,
  });

  return result;
};

const list = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: howToUseChurchLogoSearchableFields.map((field) => ({
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

  const { docs, totalDocs } = await HowToUseChurchLogo.aggregatePaginate(
    pipelines,
    options
  );

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

const getOne = async (id) => {
  const result = await HowToUseChurchLogo.findOne({ _id: id });

  if (!result) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  return result;
};

const editOne = async (payload, file) => {
  const { id, ...data } = payload;

  const exist = await HowToUseChurchLogo.findById(id);

  if (!exist) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await HowToUseChurchLogo.findOneAndUpdate(
    { _id: id },
    { $set: { ...data } },
    { new: true, upsert: true }
  );

  if (data.thumbnail !== exist.thumbnail) await removeImage(exist.thumbnail);

  return result;
};

const deleteOne = async (id) => {
  const exist = await HowToUseChurchLogo.findById(id);

  if (!exist) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await HowToUseChurchLogo.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  await removeImage(exist.thumbnail);

  return result;
};

const deleteMany = async (ids) => {
  const exists = await HowToUseChurchLogo.find({ _id: { $in: ids } });

  if (!exists.length) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await HowToUseChurchLogo.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  for (const elem of exists) {
    await removeImage(elem.thumbnail);
  }

  return result;
};

export const HowToUseChurchLogoService = {
  addHowToUseChurchLogo,
  uploadHowToUseChurchLogoImage,
  list,
  getOne,
  editOne,
  deleteOne,
  deleteMany,
};
