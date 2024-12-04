import { z } from "zod";

const updateCustomOfferMessageAction = z.object({
  body: z.object({
    id: z.string({
      required_error: "Id is required",
    }),
    action: z.enum(["accepted", "declined"], {
      required_error: "Action is required",
      invalid_type_error: "Action must be 'accepted' or 'declined'",
    }),
  }),
});

const sendMessageZodSchema = z.object({
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

export const ChatValidation = {
  updateCustomOfferMessageAction,
  sendMessageZodSchema,
};
