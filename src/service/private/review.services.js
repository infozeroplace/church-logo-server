import httpStatus from "http-status";
import { reviewSearchableFields } from "../../constant/review.constant.js";
import ApiError from "../../error/ApiError.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Review } from "../../model/review.model.js";

const deleteReviews = async (ids) => {
  const result = await Review.deleteMany({
    _id: { $in: ids },
  });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const deleteReview = async (id) => {
  const result = await Review.deleteOne({ _id: id });

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const updateReviewApproval = async (id) => {
  const existingUser = await Review.findOne({ _id: id });

  const result = await Review.findOneAndUpdate(
    { _id: id },
    { approved: !existingUser?.approved }
  );

  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

  return result;
};

const addReviewBulk = async (payload) => {
  const result = await Review.insertMany(payload);

  return result;
};

const addReview = async (payload) => {
  const result = await Review.create(payload);

  return result;
};

const getList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: reviewSearchableFields.map((field) => {
        // Check if we are dealing with firstName + lastName concatenation
        if (field.includes("firstName") || field.includes("lastName")) {
          const baseField = field.split(".")[0]; // get 'creator' or 'participant'

          return {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [
                    `$${baseField}.firstName`,
                    " ",
                    `$${baseField}.lastName`,
                  ],
                },
                regex: searchTerm,
                options: "i",
              },
            },
          };
        }

        return {
          [field]: {
            $regex: searchTerm,
            $options: "i",
          },
        };
      }),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => {
        if (field.includes("ratingPoints")) {
          return {
            [field]: +value,
          };
        } else if (field === "approved") {
          const statuses = value.split(",");
          return {
            [field]: {
              $in: statuses.map((bs) => (bs === "true" ? true : false)),
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
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "packages",
        localField: "package",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    {
      $match: whereConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const result = await Review.aggregatePaginate(pipelines, options);

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

export const ReviewService = {
  deleteReviews,
  deleteReview,
  updateReviewApproval,
  addReviewBulk,
  addReview,
  getList,
};
