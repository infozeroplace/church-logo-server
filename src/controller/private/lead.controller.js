import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import pick from "../../shared/pick.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { leadFilterableField } from "../../constant/lead.constant.js";
import { LeadService } from "../../service/private/lead.services.js";

const getList = catchAsync(async (req, res) => {
  const filters = pick(req.query, leadFilterableField);

  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await LeadService.getList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "List retrieved successfully!",
    meta,
    data,
  });
});

export const LeadController = {
  getList,
};
