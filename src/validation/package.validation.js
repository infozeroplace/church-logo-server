import { z } from "zod";
import { packageCategories } from "../constant/package.constant.js";

const additionalFeaturesSchema = z.object({
  label: z.string(),
  value: z.string(),
  price: z.number(),
});

const packageEditZodSchema = z.object({
  body: z.object({
    styleClass: z.string().optional(),
    serialId: z.number().optional(),
    title: z.string().optional(),
    category: z.enum([...packageCategories]).optional(),
    headTitle: z.string().optional(),
    subTitle: z.string().optional(),
    previewTitle: z.string().optional(),
    thumbnail1: z.string().optional(),
    thumbnail2: z.string().optional(),
    isPopular: z
      .boolean({
        invalid_type_error: "Popular type must be a boolean",
      })
      .optional(),
    basePrice: z.number().optional(),
    savings: z.number().optional(),
    featuredItems: z.string().array().optional(),
    featuredRevision: z.string().optional(),
    featuredDeliveryTime: z.string().optional(),
    featuredProgrammingLangs: z.array(additionalFeaturesSchema).optional(),
    additionalProgrammingLangs: z.array(additionalFeaturesSchema).optional(),
    additionalFeatures: z.array(additionalFeaturesSchema).optional(),
    revisions: z.array(additionalFeaturesSchema).optional(),
    deliveryTimes: z.array(additionalFeaturesSchema).optional(),
  }),
});

const packageZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required",
    }),
    headTitle: z.string({
      required_error: "Head title is required",
    }),
    subTitle: z.string({
      required_error: "Subtitle is required",
    }),
    previewTitle: z.string({
      required_error: "Preview is required",
    }),
    styleClass: z.string({
      required_error: "Style is required",
    }),
    thumbnail1: z.string({
      required_error: "Thumbnail 1 is required",
    }),
    thumbnail2: z.string({
      required_error: "Thumbnail 2 is required",
    }),
    serialId: z.number({
      required_error: "Serial id is required",
    }),
    category: z.enum([...packageCategories], {
      required_error: "Category is required",
    }),
    isPopular: z.boolean({
      required_error: "Popular is required",
      invalid_type_error: "Popular type must be a boolean",
    }),
    basePrice: z.number({
      required_error: "Base price is required",
    }),
    savings: z.number({
      required_error: "Savings is required",
    }),
    featuredItems: z.string().array(),
    featuredRevision: z.string({
      required_error: "Featured revision is required",
    }),
    featuredDeliveryTime: z.string({
      required_error: "Featured delivery time is required",
    }),
    featuredProgrammingLangs: z.array(additionalFeaturesSchema).optional(),
    additionalProgrammingLangs: z.array(additionalFeaturesSchema).optional(),
    additionalFeatures: z.array(additionalFeaturesSchema).optional(),
    revisions: z.array(additionalFeaturesSchema).optional(),
    deliveryTimes: z.array(additionalFeaturesSchema).optional(),
  }),
});

export const PackageValidation = {
  packageEditZodSchema,
  packageZodSchema,
};
