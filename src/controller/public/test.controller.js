import httpStatus from "http-status";
import { TestService } from "../../service/public/test.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const test = catchAsync(async (req, res) => {
  const result = await TestService.test(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test successful!",
    meta: null,
    data: result,
  });
});

export const TestController = {
  test,
};
