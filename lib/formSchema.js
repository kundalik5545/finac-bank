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

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["INR", "USD"]),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).default("PENDING"),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  comments: z.string().optional(),
  isActive: z.boolean().default(true),
  bankAccountId: z.string().min(1, "Bank account is required"),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  paymentMethod: z.enum(["UPI", "CASH", "CARD", "ONLINE", "OTHER"]).optional(),
  budgetId: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.enum(["INR", "USD"]).optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  date: z.string().or(z.date()).optional(),
  description: z.string().optional(),
  comments: z.string().optional(),
  isActive: z.boolean().optional(),
  bankAccountId: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["UPI", "CASH", "CARD", "ONLINE", "OTHER"])
    .optional()
    .nullable(),
  budgetId: z.string().optional().nullable(),
});

export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  bankAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  paymentMethod: z.enum(["UPI", "CASH", "CARD", "ONLINE", "OTHER"]).optional(),
  amountMin: z.coerce.number().optional(),
  amountMax: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isActive: z.coerce.boolean().optional(),
});

export const addCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const addSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  categoryId: z.string().min(1, "Category ID is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const updateSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

// Bulk upload validation schemas

/**
 * Schema for validating an array of transactions in bulk upload
 * Each transaction must match the transactionSchema
 */
export const bulkTransactionSchema = z.array(transactionSchema);

/**
 * Schema for validating a single category row in bulk upload
 * Used for separate category bulk upload
 */
export const bulkCategoryRowSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"], {
    errorMap: () => ({ message: "Category type must be INCOME, EXPENSE, TRANSFER, or INVESTMENT" }),
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Category color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

/**
 * Schema for validating an array of category rows in bulk upload
 */
export const bulkCategorySchema = z.array(bulkCategoryRowSchema);

/**
 * Schema for validating a single subcategory row in bulk upload
 * Used for separate subcategory bulk upload
 */
export const bulkSubCategoryRowSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Subcategory name is required").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Subcategory color must be a valid hex color").optional().nullable(),
  icon: z.string().optional().nullable(),
});

/**
 * Schema for validating an array of subcategory rows in bulk upload
 */
export const bulkSubCategorySchema = z.array(bulkSubCategoryRowSchema);