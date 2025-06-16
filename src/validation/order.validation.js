import { z } from "zod";

const submitCustomOffer = z.object({
  body: z.object({
    messageId: z.string({
      required_error: "Message Id is required",
    }),
    paymentIntentId: z.string({
      required_error: "payment Intent Id is required",
    }),
    category: z.string({
      required_error: "Category is required",
    }),
    delivery: z.number({
      required_error: "Delivery is required",
    }),
    offerType: z.string({
      required_error: "Offer type is required",
    }),
    price: z.number({
      required_error: "Price is required",
    }),
    revisions: z.number({
      required_error: "Revision is required",
    }),
    thumbnail: z.string({
      required_error: "Thumbnail is required",
    }),
    features: z.array(z.string()).optional(),
  }),
});

const addReview = z.object({
  body: z.object({
    orderId: z.string({
      required_error: "Order id is required",
    }),
    reviewText: z.string({
      required_error: "Review text is required",
    }),
    communicationRatings: z.number({
      required_error: "Communication rating point is required",
    }),
    serviceRatings: z.number({
      required_error: "Service rating point is required",
    }),
    recommendedRatings: z.number({
      required_error: "Recommended rating point is required",
    }),
  }),
});

const additionalItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  price: z.number(),
});

const addExtraFeatures = z.object({
  body: z.object({
    paymentIntentId: z.string({
      required_error: "payment Intent Id is required",
    }),
    orderId: z.string({
      required_error: "Order Id is required",
    }),
    extraFeatures: z.array(additionalItemSchema, {
      required_error: "Features are required",
    }),
  }),
});

const updateOrderMessageAction = z.object({
  body: z.object({
    id: z.string({
      required_error: "Id is required",
    }),
    action: z.enum(["completed", "revision"], {
      required_error: "Action is required",
      invalid_type_error: "Action must be 'completed' or 'revision'",
    }),
  }),
});

const sendOrderMessageZodSchema = z.object({
  body: z.object({
    conversationId: z.string({
      required_error: "Conversation id is required",
    }),
    text: z.string({
      required_error: "Text id is required",
    }),
    attachment: z.string().array(),
  }),
});

const contactDetailsSchema = {
  firstName: z.string({
    required_error: "First name is required",
  }),
  lastName: z.string({
    required_error: "Last name is required",
  }),
  phone: z.string({
    required_error: "Phone is required",
  }),
  country: z.string({
    required_error: "Country is required",
  }),
};

const imageSchema = z.object({
  displayName: z.string().optional(),
  publicId: z.string().optional(),
  secureUrl: z.string().optional(),
});

const requirementSchema = z.object({
  tag: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const OrderValidation = {
  submitCustomOffer,
  addReview,
  addExtraFeatures,
  updateOrderMessageAction,
  sendOrderMessageZodSchema,
};
