import { z } from "zod";

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
  sendMessageZodSchema,
};
