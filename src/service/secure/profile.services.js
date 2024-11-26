import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config/index.js";
import ApiError from "../../error/ApiError.js";
import { jwtHelpers } from "../../helper/jwtHelpers.js";
import cloudinary from "../../middleware/cloudinary.js";
import User from "../../model/user.model.js";
import { sendEmailVerificationLink } from "../../shared/nodeMailer.js";

const confirmEmailVerification = async (payload, userId) => {
  const { token } = payload;

  let verifiedUser = null;

  try {
    verifiedUser = jwtHelpers.verifiedToken(token, config?.jwt?.secret);
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, "Token expired!");
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: verifiedUser.email },
    {
      resetToken: "",
      verified: true,
    },
    { new: true }
  );

  updatedUser.password = undefined;

  return updatedUser;
};

const verifyEmail = async (payload, userId) => {
  const { email } = payload;

  const isUserExist = await User.findOne({ userId });
  const name = `${isUserExist.firstName} ${isUserExist.lastName}`;

  if (email !== isUserExist?.email)
    throw new ApiError(httpStatus.BAD_REQUEST, "Email doesn't match");

  const accessToken = jwtHelpers.createToken(
    {
      role: isUserExist?.role,
      userId: isUserExist?.userId,
      email: isUserExist?.email,
      blockStatus: isUserExist?.blockStatus,
    },
    config?.jwt?.secret,
    config?.jwt?.email_expires_in
  );

  const updatedUser = await User.findOneAndUpdate(
    { email },
    { resetToken: accessToken },
    { new: true }
  );

  if (updatedUser.resetToken) {
    await sendEmailVerificationLink(email, name, accessToken);
  } else {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

const editPassword = async (payload, userId) => {
  const { currentPassword, newPassword } = payload;

  const user = await User.findOne({ userId });

  if (!user.password || !(await user.matchPassword(currentPassword))) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Current password does not match!"
    );
  }

  const result = await User.findOneAndUpdate(
    { userId },
    {
      password: await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds)
      ),
    },
    { new: true }
  );

  result.password = undefined;

  return result;
};

const editProfileImage = async (payload, userId) => {
  const { publicId, url, oldPublicId } = payload;

  if (oldPublicId) {
    await cloudinary.v2.uploader.destroy(oldPublicId);
  }

  const imageData = {
    photo: {
      publicId,
      url,
    },
  };

  const result = await User.findOneAndUpdate(
    { userId },
    {
      $set: { ...imageData },
    },
    { new: true, upsert: true }
  );

  result.password = undefined;

  return result;
};

const editProfile = async (payload, userId) => {
  const result = await User.findOneAndUpdate(
    { userId },
    { $set: { ...payload } },
    { new: true, upsert: true }
  );

  result.password = undefined;

  return result;
};

export const ProfileService = {
  confirmEmailVerification,
  verifyEmail,
  editPassword,
  editProfileImage,
  editProfile,
};
