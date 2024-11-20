import httpStatus from "http-status";
import { DashboardService } from "../../service/private/Dashboard.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const getAdminDashboardData = catchAsync(async (req, res) => {
  const user = req.user;
  const { ...query } = req.query;

  const result = await DashboardService.getAdminDashboardData(user, query);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog retrieved successfully",
    meta: null,
    data: result,
  });
});

export const DashboardController = { getAdminDashboardData };
