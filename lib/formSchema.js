import { z } from "zod";

export const addBankSchema = z.object({
  bankName: z.string().min(1).min(2).max(100),
  userId: z.string().min(1),
  accountNumber: z.string().min(1).optional(),
  iFSC_Code: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  openingBalance: z.number().min(0),
  accountType: z.string(),
  statuses: z.string(),
  currency: z.string(),
  isPrimary: z.unknown(),
  comments: z.string().min(1).min(2).optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});