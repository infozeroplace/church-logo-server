import { z } from "zod";

const blogBody = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  metaTitle: z.string({
    required_error: "Meta title is required",
  }),
  metaDescription: z.string({
    required_error: "Meta description is required",
  }),
  content: z.string({
    required_error: "Content is required",
  }),
});

const fileBody = z.object({
  fieldname: z.string({
    required_error: "Field name is required",
  }),
  originalname: z.string({
    required_error: "Original name is required",
  }),
  encoding: z.string({
    required_error: "Encoding is required",
  }),
  mimetype: z.string({
    required_error: "Mime type is required",
  }),
  destination: z.string({
    required_error: "Destination is required",
  }),
  filename: z.string({
    required_error: "File name is required",
  }),
  path: z.string({
    required_error: "Path name is required",
  }),
  size: z.number({
    required_error: "Size is required",
  }),
});

const addBlogZodSchema = z.object({
  body: blogBody,
  file: fileBody,
});

const editBlogBody = z.object({
  id: z.string({
    required_error: "ID is required",
  }),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  thumbnail: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const editFileBody = z.object({
  fieldname: z.string().optional(),
  originalname: z.string().optional(),
  encoding: z.string().optional(),
  mimetype: z.string().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
  size: z.number().optional(),
}).optional();

const editBlogZodSchema = z.object({
  body: editBlogBody,
  file: editFileBody,
});

export const BlogValidation = {
  addBlogZodSchema,
  editBlogZodSchema
};
