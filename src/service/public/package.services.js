import httpStatus from "http-status";
import { packageSearchableFields } from "../../constant/package.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Package } from "../../model/package.model.js";

const getOnePackage = async (id) => {
  const result = await Package.findOne({ packageId: id });

  if (!result) throw new ApiError(httpStatus.BAD_REQUEST, "Package not found!");

  return result;
};

const getPackageList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: packageSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => {
        if (field === "isPopular") {
          return {
            [field]: value === "true",
          };
        } else if (field === "basePrice") {
          const prices = value.split(",");
          return {
            [field]: {
              $gte: +prices[0],
              $lte: +prices[1],
            },
          };
        } else {
          return {
            [field]: value,
          };
        }
      }),
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

  const result = await Package.aggregatePaginate(pipelines, options);

  const { docs, totalDocs } = result;

  return {
    meta: {
      page,
      limit,
      totalDocs,
    },
    data: docs,
  };
};

export const PackageService = {
  getOnePackage,
  getPackageList,
};
