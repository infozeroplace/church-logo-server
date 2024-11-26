import express from "express";
import { ProfileController } from "../../controller/private/profile.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ProfileValidation } from "../../validation/profile.validation.js";
import limiter from "../../middleware/limiter.js";

const router = express.Router();

router.put(
  "/profile/edit-password",
  auth(
    ENUM_USER_ROLE.MODERATOR,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN
  ),
  limiter(5, 10),
  validateRequest(ProfileValidation.editPasswordZodSchema),
  ProfileController.editPassword
);

router.put(
  "/profile/edit-profile-image",
  auth(
    ENUM_USER_ROLE.MODERATOR,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN
  ),
  validateRequest(ProfileValidation.editProfileImageZodSchema),
  ProfileController.editProfileImage
);

router.put(
  "/profile/edit",
  auth(
    ENUM_USER_ROLE.MODERATOR,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN
  ),
  validateRequest(ProfileValidation.editProfileZodSchema),
  ProfileController.editProfile
);

export const ProfileRoutes = router;
