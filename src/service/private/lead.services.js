import { leadSearchableFields } from "../../constant/lead.constant.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Lead } from "../../model/lead.model.js";

const getList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: leadSearchableFields.map((field) => ({
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
        if (field === "countryName") {
          const countries = value.split(",");
          return {
            [field]: { $in: countries },
          };
        } else if (field === "continentName") {
          const continents = value.split(",");
          return {
            [field]: { $in: continents },
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

  const result = await Lead.aggregatePaginate(pipelines, options);

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

export const LeadService = {
  getList,
};
