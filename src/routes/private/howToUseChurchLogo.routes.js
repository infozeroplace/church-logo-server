import express from "express";
import { HowToUseChurchLogoController } from "../../controller/private/howToUseChurchLogo.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import { singleImageUploader } from "../../middleware/multer.js";
import validateRequest from "../../middleware/validateRequest.js";
import { HowToUseChurchLogoValidation } from "../../validation/howToUseChurchLogo.js";

const router = express.Router();

router.post(
  "/how-to-use-church-logo/add",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(HowToUseChurchLogoValidation.addHowToUseChurchLogoZodSchema),
  HowToUseChurchLogoController.addHowToUseChurchLogo
);

router.post(
  "/how-to-use-church-logo/post-image",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  singleImageUploader,
  HowToUseChurchLogoController.uploadHowToUseChurchLogoImage
);

router.get(
  "/how-to-use-church-logo/list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  HowToUseChurchLogoController.list
);

router.put(
  "/how-to-use-church-logo/edit",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(HowToUseChurchLogoValidation.editHowToUseChurchLogoZodSchema),
  HowToUseChurchLogoController.editOne
);

router.delete(
  "/how-to-use-church-logo/delete-many",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  HowToUseChurchLogoController.deleteMany
);

router.get(
  "/how-to-use-church-logo/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  HowToUseChurchLogoController.getOne
);

router.delete(
  "/how-to-use-church-logo/delete-one/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  HowToUseChurchLogoController.deleteOne
);

export const HowToUseChurchLogoRoutes = router;
