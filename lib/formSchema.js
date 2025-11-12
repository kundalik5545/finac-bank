import { z } from "zod";

export const addBankSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["BANK", "WALLET", "CASH", "CREDIT_CARD"]),
  currency: z.enum(["INR", "USD"]),
  isActive: z.boolean().default(true),
  balance: z.number().min(0).default(0),
  ifscCode: z.string().optional(),
  branch: z.string().optional(),
  bankId: z.string().optional(),
  bankAccount: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const updateBankSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(["BANK", "WALLET", "CASH", "CREDIT_CARD"]).optional(),
  currency: z.enum(["INR", "USD"]).optional(),
  isActive: z.boolean().optional(),
  balance: z.number().min(0).optional(),
  ifscCode: z.string().optional(),
  branch: z.string().optional(),
  bankId: z.string().optional(),
  bankAccount: z.string().optional(),
  isPrimary: z.boolean().optional(),
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
