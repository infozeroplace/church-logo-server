import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { LeadService } from "../../service/public/lead.services.js";

const lead = catchAsync(async (req, res) => {
  const { ...payload } = req.body;

  const result = await LeadService.lead(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lead successfully",
    meta: null,
    data: result,
  });
});

export const LeadController = {
  lead,
};
