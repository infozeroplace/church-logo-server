import { z } from "zod";

const reviewZodObject = z.object({
  user: z.string({
    required_error: "User id is required",
  }),
  package: z.string({
    required_error: "Package id is required",
  }),
  productImageUrl: z.string({
    required_error: "Product image url is required",
  }),
  ratingPoints: z
    .number({
      required_error: "Rating point is required",
    })
    .min(1)
    .max(5),
  reviewText: z.string({
    required_error: "Review is required",
  }),
});

const reviewZodSchema = z.object({
  body: reviewZodObject,
});

const bulkReviewZodSchema = z.object({
  body: z.array(reviewZodObject),
});

export const ReviewValidation = {
  bulkReviewZodSchema,
  reviewZodSchema,
};
