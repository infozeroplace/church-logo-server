import express from "express";
import { UploadController } from "../../controller/secure/upload.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import { singlePhotoUploader } from "../../middleware/multer.js";

const router = express.Router();

router.post(
  "/upload/single-photo",
  auth(ENUM_USER_ROLE.USER),
  singlePhotoUploader,
  UploadController.singlePhotoUpload
);

router.delete(
  "/remove/single-photo",
  auth(ENUM_USER_ROLE.USER),
  UploadController.singlePhotoRemove
);

export const UploadRoutes = router;
