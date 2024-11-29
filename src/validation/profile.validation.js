import { z } from "zod";

const confirmEmailVerificationZodSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: "Token is required",
      })
      
  }),
});

const emailVerificationZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Invalid email address" }),
  }),
});

const editPasswordForGoogleUserZodSchema = z.object({
  body: z.object({
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .regex(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{6,}$/, {
        message:
          "Password must contain one special character and minimum six characters.",
      }),
  }),
});

const editPasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: "Current password is required",
    }),
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .regex(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{6,}$/, {
        message:
          "Password must contain one special character and minimum six characters.",
      }),
  }),
});

const editProfileImageZodSchema = z.object({
  body: z.object({
    publicId: z.string({
      required_error: "Public id is required",
    }),
    url: z
      .string({
        required_error: "URL is required",
      })
      .url(),
    oldPublicId: z.string({
      required_error: "Old public id is required",
    }),
  }),
});

const editProfileZodSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const ProfileValidation = {
  editPasswordForGoogleUserZodSchema,
  confirmEmailVerificationZodSchema,
  emailVerificationZodSchema,
  editPasswordZodSchema,
  editProfileImageZodSchema,
  editProfileZodSchema,
};
