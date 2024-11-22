import express from "express";
import { SystemController } from "../../controller/private/system.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import {
  handleHomeShowCaseLogoUploader,
  handleZeroPlaceImageUploader,
  multipleImageUploader,
  singleImageUploader,
} from "../../middleware/multer.js";
import validateRequest from "../../middleware/validateRequest.js";
import { SystemValidation } from "../../validation/system.validation.js";

const router = express.Router();

router.put(
  "/system/update-about-us-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updateAboutUsSettings
);

router.put(
  "/system/update-logo",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updateLogo
);

router.put(
  "/system/update-package-offer-percentages",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updatePackageOfferPercentages
);

router.put(
  "/system/update-contact-us-thumbnail",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updateContactUsThumbnail
);

router.put(
  "/system/update-general-faq-thumbnail",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updateGeneralFaqThumbnail
);

router.put(
  "/system/update-general-faq",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.updateGeneralFaq
);

router.put(
  "/system/update-category-faq",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.categoryFaq),
  SystemController.updateCategoryFaq
);

router.put(
  "/system/update-category-thumbnail",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.categoryThumbnail),
  SystemController.updateCategoryThumbnail
);

router.put(
  "/system/update-gallery-images",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  handleHomeShowCaseLogoUploader,
  SystemController.updateGalleryImages
);

router.get(
  "/system/get-system-configuration",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  SystemController.getSystemConfiguration
);

router.put(
  "/system/update-order-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.orderSettingsZodSchema),
  SystemController.updateOrderSettings
);

router.put(
  "/system/update-home-personal-signature-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  singleImageUploader,
  SystemController.updateHomePersonalSignatureSettings
);

router.put(
  "/system/update-home-customers-doing-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  handleHomeShowCaseLogoUploader,
  SystemController.updateHomeCustomersDoingSettings
);

router.put(
  "/system/update-home-show-case-logo-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  handleHomeShowCaseLogoUploader,
  SystemController.updateHomeShowCaseLogoSettings
);

router.put(
  "/system/update-home-zero-place-promotional-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  handleZeroPlaceImageUploader,
  SystemController.updateHomeZeroPlacePromotionalSettings
);

router.put(
  "/system/update-home-portfolio-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  multipleImageUploader,
  validateRequest(SystemValidation.homePortfolioSettingsZodSchema),
  SystemController.updateHomePortfolioSettings
);

router.put(
  "/system/update-home-service-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  multipleImageUploader,
  validateRequest(SystemValidation.homeServiceSettingsZodSchema),
  SystemController.updateHomeServiceSettings
);

router.put(
  "/system/update-home-category-thumbnail-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  singleImageUploader,
  validateRequest(SystemValidation.homeCategoryThumbnailSettingsZodSchema),
  SystemController.updateHomeCategoryThumbnailSettings
);

router.put(
  "/system/update-home-category-visibility-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.homeCategoryVisibilitySettingsZodSchema),
  SystemController.updateHomeCategoryVisibilitySettings
);

router.put(
  "/system/update-home-category-text-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.homeCategoryTextSettingsZodSchema),
  SystemController.updateHomeCategoryTextSettings
);

router.put(
  "/system/update-home-settings",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.homeSettingsZodSchema),
  SystemController.updateHomeSettings
);

router.put(
  "/system/update-terms-and-conditions",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.updatePrivacyPolicyZodSchema),
  SystemController.updateTermsAndConditions
);

router.put(
  "/system/update-privacy-policy",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SystemValidation.updatePrivacyPolicyZodSchema),
  SystemController.updatePrivacyPolicy
);

export const SystemRoutes = router;
