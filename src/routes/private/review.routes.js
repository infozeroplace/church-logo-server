import express from "express";
import { ReviewController } from "../../controller/private/review.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ReviewValidation } from "../../validation/review.validation.js";

const router = express.Router();

router.delete(
  "/review/delete-reviews",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  ReviewController.deleteReviews
);

router.delete(
  "/review/delete-review/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  ReviewController.deleteReview
);

router.put(
  "/review/update-status/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ReviewController.updateReviewApproval
);

router.post(
  "/review/bulk/add",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(ReviewValidation.bulkReviewZodSchema),
  ReviewController.addReviewBulk
);

router.post(
  "/review/add",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(ReviewValidation.reviewZodSchema),
  ReviewController.addReview
);

router.get(
  "/review/list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ReviewController.getList
);

export const ReviewRoutes = router;
