import { z } from "zod";

const resetPasswordZodSchema = z.object({
  body: z.object({
    token: z.string({
      required_error: "Token is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .regex(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{6,}$/, {
        message:
          "Password must contain one special character and minimum six characters.",
      }),
  }),
});

const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Invalid email address" }),
  }),
});

const registerZodSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "First name is required",
    }),
    lastName: z.string({
      required_error: "Last name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Invalid email address" }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .regex(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{6,}$/),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Invalid email address" }),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});

const googleLoginZodSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: "Code is required",
    }),
  }),
});

const refreshTokenZodSchema = z.object({
  body: z.object({
    token: z.string({
      required_error: "Refresh token is required",
    }),
  }),
});

export const AuthValidation = {
  resetPasswordZodSchema,
  forgotPasswordZodSchema,
  registerZodSchema,
  loginZodSchema,
  googleLoginZodSchema,
  refreshTokenZodSchema,
};
