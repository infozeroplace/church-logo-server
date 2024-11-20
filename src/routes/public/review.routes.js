import express from "express";
import { ReviewController } from "../../controller/public/review.controller.js";
const router = express.Router();

router.get("/review", ReviewController.getReviewList);

export const ReviewRoutes = router;
