import express from "express";
import { MembersController } from "../../controller/private/members.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { MembersValidation } from "../../validation/members.validation.js";

const router = express.Router();

router.get(
  "/members/get-task-counts:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  MembersController.getTaskCounts
);

router.post(
  "/members/add-moderator",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(MembersValidation.addModeratorZodSchema),
  MembersController.addModerator
);

router.delete(
  "/members/delete-users",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  MembersController.deleteUsers
);

router.get(
  "/members/all-moderator",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  MembersController.getAllModerator
);

router.get(
  "/members/user-list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  MembersController.getUserList
);

router.put(
  "/members/update-status/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  MembersController.updateStatus
);

router.delete(
  "/members/delete-user/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  MembersController.deleteOneUser
);

export const MembersRoutes = router;
