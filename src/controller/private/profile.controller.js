import httpStatus from "http-status";
import { ProfileService } from "../../service/private/profile.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const editPassword = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await ProfileService.editPassword(req.body, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully",
    meta: null,
    data: result,
  });
});

const editProfileImage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await ProfileService.editProfileImage(req.body, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image uploaded",
    meta: null,
    data: result,
  });
});

const editProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await ProfileService.editProfile(req.body, userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile edited successfully",
    meta: null,
    data: result,
  });
});

export const ProfileController = {
  editPassword,
  editProfileImage,
  editProfile,
};
