import { z } from "zod";

const additionalItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  price: z.number(),
});

const contactDetails = z.object(
  {
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    country: z.string(),
  },
  {
    required_error: "Contact details are required",
  }
);

const createCustomOfferPaymentIntentZod = z.object({
  body: z.object({
    givenUserId: z.string({
      required_error: "Given user Id is required",
    }),
    category: z.string({
      required_error: "Category is required",
    }),
    offerType: z.string({
      required_error: "Offer type is required",
    }),
    thumbnail: z.string({
      required_error: "Thumbnail is required",
    }).url(),
    delivery: z.number({
      required_error: "Deliver day is required",
    }),
    revisions: z.number({
      required_error: "Revision is required",
    }),
    price: z.number({
      required_error: "Price is required",
    }),
    features: z.array(z.string()).optional(),
  }),
});

const createExtraFeaturesPaymentIntentZod = z.object({
  body: z.object({
    orderId: z.string({
      required_error: "Order Id is required",
    }),
    givenUserId: z.string({
      required_error: "Given user Id is required",
    }),
    extraFeatures: z.array(additionalItemSchema, {
      required_error: "Features are required",
    }),
  }),
});

const createPaymentIntentZod = z.object({
  body: z.object({
    userId: z.string({
      required_error: "User Id is required",
    }),
    packageId: z.string({
      required_error: "Package Id is required",
    }),
    additionalEmail: z.string({
      required_error: "Additional email is required",
    }),
    contactDetails: contactDetails,
    selectedAdditionalFeats: z.array(additionalItemSchema).optional(),
    selectedAdditionalRevision: z.array(additionalItemSchema).optional(),
    selectedAdditionalDeliveryTime: z.array(additionalItemSchema).optional(),
    selectedProgrammingLang: z.array(additionalItemSchema).optional(),
  }),
});

export const PaymentValidation = {
  createCustomOfferPaymentIntentZod,
  createExtraFeaturesPaymentIntentZod,
  createPaymentIntentZod,
};
