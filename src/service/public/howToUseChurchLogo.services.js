import httpStatus from "http-status";
import { howToUseChurchLogoSearchableFields } from "../../constant/howToUseChurchLogo.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { HowToUseChurchLogo } from "../../model/howToUseChurchLogo.js";

const getOne = async (id) => {
  const result = await HowToUseChurchLogo.findOne({ _id: id });

  if (!result) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

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

export const HowToUseChurchLogoService = {
  getOne,
  list,
};
