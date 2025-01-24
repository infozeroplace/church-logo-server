import express from "express";
import { GalleryController } from "../../controller/private/gallery.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import { handleHomeShowCaseLogoUploader } from "../../middleware/multer.js";

const router = express.Router();

router.put(
  "/gallery/update-gallery-branding-images",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  GalleryController.updateGalleryBrandingImages
);

router.post(
  "/gallery/insert-branding-photos",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  GalleryController.insertBrandingPhotos
);

router.put(
  "/gallery/update-gallery-images",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  GalleryController.updateGalleryImages
);

router.get(
  "/gallery/get-gallery-images",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  GalleryController.getGalleryImages
);

router.post(
  "/gallery/insert-photos",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  GalleryController.insertPhotos
);

export const GalleryRoutes = router;
