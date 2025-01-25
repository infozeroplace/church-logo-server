import { z } from "zod";

const howToUseChurchLogoBody = z.object({
  headTitle: z.string({
    required_error: "Head title is required",
  }),
  subTitle: z.string({
    required_error: "Sub title is required",
  }),
  shortDesc: z.string({
    required_error: "Short description is required",
  }),
  content: z.string({
    required_error: "Content is required",
  }),
  thumbnail: z
    .string({
      required_error: "Thumbnail is required",
    }),
});

const addHowToUseChurchLogoZodSchema = z.object({
  body: howToUseChurchLogoBody,
});

const editHowToUseChurchLogoBody = z.object({
  id: z.string({
    required_error: "ID is required",
  }),
  headTitle: z.string({
    required_error: "Head title is required",
  }),
  subTitle: z.string({
    required_error: "Sub title is required",
  }),
  shortDesc: z.string({
    required_error: "Short description is required",
  }),
  content: z.string({
    required_error: "Content is required",
  }),
  thumbnail: z
    .string({
      required_error: "Thumbnail is required",
    }),
});

const editHowToUseChurchLogoZodSchema = z.object({
  body: editHowToUseChurchLogoBody,
});

export const HowToUseChurchLogoValidation = {
  addHowToUseChurchLogoZodSchema,
  editHowToUseChurchLogoZodSchema,
};
