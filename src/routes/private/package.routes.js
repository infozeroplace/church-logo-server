import express from "express";
import { PackageController } from "../../controller/private/package.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import { multipleImageUploader } from "../../middleware/multer.js";
import validateRequest from "../../middleware/validateRequest.js";
import { PackageValidation } from "../../validation/package.validation.js";

const router = express.Router();

router.delete(
  "/package/delete-packages",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  PackageController.deletePackages
);

router.get(
  "/package/package-list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  PackageController.getPackageList
);

router.put(
  "/package/edit",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PackageValidation.packageEditZodSchema),
  PackageController.editPackage
);

router.post(
  "/package/add",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PackageValidation.packageZodSchema),
  PackageController.addPackage
);

router.delete(
  "/package/delete-package/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  PackageController.deletePackage
);

router.get(
  "/package/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  PackageController.getOnePackage
);

export const PackageRoutes = router;
