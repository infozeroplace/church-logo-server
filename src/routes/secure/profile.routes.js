import express from "express";
import { ProfileController } from "../../controller/secure/profile.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ProfileValidation } from "../../validation/profile.validation.js";

const router = express.Router();

router.post(
  "/profile/confirm-email-verification",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(ProfileValidation.confirmEmailVerificationZodSchema),
  ProfileController.confirmEmailVerification
);

router.post(
  "/profile/verify-email",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(ProfileValidation.emailVerificationZodSchema),
  ProfileController.verifyEmail
);

router.put(
  "/profile/edit-password",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(ProfileValidation.editPasswordZodSchema),
  ProfileController.editPassword
);

router.put(
  "/profile/edit-profile-image",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(ProfileValidation.editProfileImageZodSchema),
  ProfileController.editProfileImage
);

router.put(
  "/profile/edit",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(ProfileValidation.editProfileZodSchema),
  ProfileController.editProfile
);

export const ProfileRoutes = router;
