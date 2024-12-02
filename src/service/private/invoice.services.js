import { invoiceSearchableFields } from "../../constant/invoice.constant.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import { Invoice } from "../../model/invoice.model.js";

const getInvoice = async (id) => {
  const result = await Invoice.findById(id);
  return result;
};

const getInvoiceList = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: invoiceSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const filterHandlers = {
      type: (value) => {
        const types = value.split(",");
        return {
          type: {
            $in: types,
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

  const { docs, totalDocs } = await Invoice.aggregatePaginate(
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

export const InvoiceService = {
  getInvoice,
  getInvoiceList,
};
