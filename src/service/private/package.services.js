import httpStatus from "http-status";
import { packageSearchableFields } from "../../constant/package.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Package } from "../../model/package.model.js";
import generatePackageId from "../../utils/generatePackageId.js";

const deletePackages = async (ids) => {
  const result = await Package.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deletePackage = async (id) => {
  const result = await Package.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

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
    const filterHandlers = {
      isPopular: (value) => ({
        isPopular: value === "true",
      }),
      basePrice: (value) => {
        const [min, max] = value.split(",").map(Number);
        return {
          basePrice: {
            $gte: min,
            $lte: max,
          },
        };
      },
      category: (value) => {
        const categories = value.split(",");
        return {
          category: {
            $in: categories,
          },
        };
      },
      default: (field, value) => ({
        [field]: value,
      }),
    };

    if (Object.keys(filtersData).length) {
      andCondition.push({
        $and: Object.entries(filtersData).map(([field, value]) => {
          const handler = filterHandlers[field] || filterHandlers.default;
          return handler(field === "default" ? [field, value] : value);
        }),
      });
    }
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

  // const result = await Package.findOneAndUpdate(
  //   { packageId },
  //   { $set: { ...data } },
  //   { new: true, upsert: true }
  // );

  // return result;

const editPackage = async (payload) => {
  const { packageId, ...data } = payload;

  // Log the original title
  console.log("Original Title:", data.title);

  // Clean and format the title
  const formattedTitle = data.title
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove symbols except letters, numbers, and spaces
    .trim()                            // Remove extra spaces from start and end
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .toLowerCase();                    // Convert to lowercase

  console.log("Formatted Title:", formattedTitle);

  // Update the package with the formatted title
  const result = await Package.findOneAndUpdate(
    { packageId },
    {
      $set: {
        packageId: formattedTitle,
      },
    }
  );

  return result;
};

const addPackage = async (payload) => {
  const packageId = await generatePackageId();

  const result = await Package.create({ packageId, ...payload });

  return result;
};

export const PackageService = {
  deletePackages,
  deletePackage,
  getOnePackage,
  getPackageList,
  editPackage,
  addPackage,
};
