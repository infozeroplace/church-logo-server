import { z } from "zod";

const faq = z.object({
  question: z.string({
    required_error: "Question is required",
  }),
  answer: z.string({
    required_error: "Answer is required",
  }),
});

const categoryFaq = z.object({
  body: z.object({
    category: z.string({
      required_error: "Category is required",
    }),
    faqs: z.array(faq, {
      required_error: "Faqs are required",
    }),
  }),
});

const categoryThumbnail = z.object({
  body: z.object({
    categoryTitle: z.string({
      required_error: "Category title is required",
    }),
    thumbnailUrl: z.string({
      required_error: "Thumbnail url is required",
    }),
  }),
});

const portfolio = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  uid: z
    .string({
      required_error: "UID is required",
    })
    .optional(),
});

const homePortfolioSettingsZodSchema = z.object({
  body: z.object({
    portfolios: z.array(portfolio, {
      required_error: "Portfolios are required",
    }),
  }),
});

const service = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  uid: z
    .string({
      required_error: "UID is required",
    })
    .optional(),
});

const homeServiceSettingsZodSchema = z.object({
  body: z.object({
    serviceTitle: z.string({
      required_error: "Service title is required",
    }),
    services: z.array(service, {
      required_error: "services are required",
    }),
  }),
});

const homeCategoryThumbnailSettingsZodSchema = z.object({
  body: z.object({
    category: z.string({
      required_error: "Category is required",
    }),
    url: z.string({
      required_error: "URL is required",
    }),
  }),
});

const homeCategoryVisibilitySettingsZodSchema = z.object({
  body: z.object({
    visibility: z.boolean({
      required_error: "Visibility is required",
    }),
    category: z.string({
      required_error: "Category is required",
    }),
  }),
});

const homeCategoryTextSettingsZodSchema = z.object({
  body: z.object({
    categoryTitle: z.string({
      required_error: "Category title is required",
    }),
    categoryDescription: z.string({
      required_error: "Category description is required",
    }),
  }),
});

const updatePrivacyPolicyZodSchema = z.object({
  body: z.object({
    heading: z.string({
      required_error: "Heading is required",
    }),
    content: z.string({
      required_error: "Content is required",
    }),
    lastUpdate: z.string({
      required_error: "Last update is required",
    }),
  }),
});

const bannerImage = z.object({
  url: z.string(),
  serialId: z.number(),
});

const homeSettingsZodSchema = z.object({
  body: z.object({
    offerText: z.string({
      required_error: "Heading is required",
    }),
    bannerTitle: z.string({
      required_error: "Content is required",
    }),
    bannerDescription: z.string({
      required_error: "Last update is required",
    }),
    bannerImages: z.array(bannerImage),
  }),
});

const orderSampleImage = z.object({
  uid: z.string(),
  url: z.string(),
  serialId: z.number(),
  publicId: z.string(),
});

const orderSettingsZodSchema = z.object({
  body: z.object({
    designSample: z.array(bannerImage),
    psDesignSample: z.array(bannerImage),
    colorSample: z.array(bannerImage),
  }),
});

export const SystemValidation = {
  categoryFaq,
  categoryThumbnail,
  homePortfolioSettingsZodSchema,
  homeServiceSettingsZodSchema,
  homeCategoryThumbnailSettingsZodSchema,
  homeCategoryVisibilitySettingsZodSchema,
  homeCategoryTextSettingsZodSchema,
  orderSettingsZodSchema,
  homeSettingsZodSchema,
  updatePrivacyPolicyZodSchema,
};
