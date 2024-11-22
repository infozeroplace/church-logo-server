import httpStatus from "http-status";
import { SystemService } from "../../service/private/system.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const updateContactUsSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateContactUsSettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateAboutUsSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateAboutUsSettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateLogo = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateLogo(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updatePackageOfferPercentages = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updatePackageOfferPercentages(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateContactUsThumbnail = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateContactUsThumbnail(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateGeneralFaqThumbnail = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateGeneralFaqThumbnail(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateGeneralFaq = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await SystemService.updateGeneralFaq(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateCategoryFaq = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateCategoryFaq(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateCategoryThumbnail = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateCategoryThumbnail(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated successfully!",
    meta: null,
    data: result,
  });
});

const updateGalleryImages = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateGalleryImages(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Gallery images updated successfully!",
    meta: null,
    data: result,
  });
});

const getSystemConfiguration = catchAsync(async (req, res) => {
  const result = await SystemService.getSystemConfiguration();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Privacy policy retrieved successfully!",
    meta: null,
    data: result,
  });
});

const updateOrderSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateOrderSettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order settings updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomePersonalSignatureSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    file: req.file,
  };

  const result = await SystemService.updateHomePersonalSignatureSettings(
    payload
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home personal signature updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeCustomersDoingSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateHomeCustomersDoingSettings(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home customer doing updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeShowCaseLogoSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateHomeShowCaseLogoSettings(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home show case updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeZeroPlacePromotionalSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateHomeZeroPlacePromotionalSettings(
    payload
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home portfolio updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomePortfolioSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateHomePortfolioSettings(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home portfolio updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeServiceSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const payload = {
    data: data,
    files: req.files,
  };

  const result = await SystemService.updateHomeServiceSettings(payload);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home service updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeCategoryThumbnailSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;
  const { ...file } = req.file;

  const payload = {
    ...data,
    ...file,
  };

  const result = await SystemService.updateHomeCategoryThumbnailSettings(
    payload
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home category settings updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeCategoryVisibilitySettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateHomeCategoryVisibilitySettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home category settings updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeCategoryTextSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateHomeCategoryTextSettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home category settings updated successfully!",
    meta: null,
    data: result,
  });
});

const updateHomeSettings = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateHomeSettings(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home settings updated successfully!",
    meta: null,
    data: result,
  });
});

const updateTermsAndConditions = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updateTermsAndConditions(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Terms and conditions updated successfully!",
    meta: null,
    data: result,
  });
});

const updatePrivacyPolicy = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await SystemService.updatePrivacyPolicy(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Privacy policy updated successfully!",
    meta: null,
    data: result,
  });
});

export const SystemController = {
  updateContactUsSettings,
  updateAboutUsSettings,
  updateLogo,
  updatePackageOfferPercentages,
  updateContactUsThumbnail,
  updateGeneralFaqThumbnail,
  updateGeneralFaq,
  updateCategoryFaq,
  updateCategoryThumbnail,
  updateGalleryImages,
  updateHomePersonalSignatureSettings,
  updateHomeCustomersDoingSettings,
  updateHomeShowCaseLogoSettings,
  updateHomeZeroPlacePromotionalSettings,
  updateHomePortfolioSettings,
  updateHomeServiceSettings,
  updateHomeCategoryThumbnailSettings,
  updateHomeCategoryVisibilitySettings,
  updateHomeCategoryTextSettings,
  updateHomeSettings,
  updateOrderSettings,
  getSystemConfiguration,
  updateTermsAndConditions,
  updatePrivacyPolicy,
};
