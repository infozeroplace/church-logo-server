import httpStatus from "http-status";
import { packageSearchableFields } from "../../constant/package.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Package } from "../../model/package.model.js";
import { removeImage } from "../../utils/fileSystem.js";
import generatePackageId from "../../utils/generatePackageId.js";

const deletePackages = async (ids) => {
  const exists = await Package.find({ _id: { $in: ids } });

  if (!exists.length) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await Package.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  for (const elem of exists) {
    if (elem.thumbnail1) await removeImage(elem.thumbnail1);
    if (elem.thumbnail2) await removeImage(elem.thumbnail2);
  }

  return result;
};

const deletePackage = async (id) => {
  const exist = await Package.findById(id);

  if (!exist) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await Package.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  if (exist.thumbnail1) await removeImage(exist.thumbnail1);
  if (exist.thumbnail2) await removeImage(exist.thumbnail2);

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

const editPackage = async (payload) => {
  const { packageId, ...data } = payload;

  const exist = await Package.findOne({ packageId });

  if (!exist) throw new ApiError(httpStatus.BAD_REQUEST, "Not found!");

  const result = await Package.findOneAndUpdate(
    { packageId },
    { $set: { ...data } },
    { new: true, upsert: true }
  );

  if (data.thumbnail1 !== exist.thumbnail1) await removeImage(exist.thumbnail1);
  if (data.thumbnail2 !== exist.thumbnail2) await removeImage(exist.thumbnail2);

  return result;
};

const addPackage = async (payload) => {
  const packageId = await generatePackageId(payload);

  if (!packageId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Package Id exists");
  }

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
