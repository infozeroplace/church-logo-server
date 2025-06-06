import { reviewSearchableFields } from "../../constant/review.constant.js";
import getDateRange from "../../helper/getDateRange.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Review } from "../../model/review.model.js";

const getReviewList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  filtersData["approved"] = true;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: reviewSearchableFields.map((field) => ({
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
        if (field === "date") {
          const dates = value.split(",");
          return {
            [field]: { $in: getDateRange(dates[0], dates[1]) },
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
    {
      $unwind: {
        path: "$package",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: [
        "user.userId",
        "user.email",
        "user.password",
        "user.blockStatus",
        "user.role",
        "user.departments",
        "user.isGoogleLogin",
        "user.rank",
        "user.country",
        "user.designation",
        "user.phone",
        "user.address",
        "user.resetToken",
        "user.createdAt",
        "user.updatedAt",
        "user.__v",
        "user._id",
        "package._id",
        "package.__v",
        "package.createdAt",
        "package.updatedAt",
      ],
    },
    {
      $match: whereConditions,
    },
  ];

  const options = {
    page: page,
    limit: limit,
    sort: sortConditions,
  };

  const { docs, totalDocs } = await Review.aggregatePaginate(
    pipelines,
    options
  );

  const averagePipeline = [
    ...pipelines,
    { $group: { _id: null, averageRating: { $avg: "$ratingPoints" } } },
  ];

  const [averageResult] = await Review.aggregate(averagePipeline);
  const averageRating = averageResult?.averageRating || 0;

  return {
    meta: {
      page,
      limit,
      totalDocs,
      averageRating,
    },
    data: docs,
  };
};

export const ReviewService = {
  getReviewList,
};
