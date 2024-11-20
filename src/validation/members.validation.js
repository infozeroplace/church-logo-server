import { z } from "zod";

const addModeratorZodSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "First name is required",
    }),
    lastName: z.string({
      required_error: "Last name is required",
    }),
    phone: z.string({
      required_error: "Phone is required",
    }),
    designation: z.string({
      required_error: "Designation is required",
    }),
    country: z.string({
      required_error: "Country is required",
    }),
    gender: z.string({
      required_error: "Gender is required",
    }),
    role: z.string({
      required_error: "Role is required",
    }),
    departments: z.string({
      required_error: "Department is required",
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

export const MembersValidation = {
  addModeratorZodSchema,
};
