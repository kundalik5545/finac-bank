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
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
});

export const addSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  categoryId: z.string().min(1, "Category ID is required"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
});

export const updateSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
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
    errorMap: () => ({
      message: "Category type must be INCOME, EXPENSE, TRANSFER, or INVESTMENT",
    }),
  }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Category color must be a valid hex color")
    .optional()
    .nullable(),
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
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Subcategory color must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
});

/**
 * Schema for validating an array of subcategory rows in bulk upload
 */
export const bulkSubCategorySchema = z.array(bulkSubCategoryRowSchema);

// Recurring Transaction validation schemas

export const addRecurringTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).default("PENDING"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateRecurringTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional().nullable(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  bankAccountId: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const recurringTransactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  bankAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["startDate", "amount", "frequency"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Budget validation schemas

export const addBudgetSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  month: z.number().int().min(1).max(12, "Month must be between 1 and 12"),
  year: z.number().int().min(2000).max(2100, "Year must be valid"),
  categoryId: z
    .union([z.string(), z.null(), z.literal("none")])
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === "none" ? null : val)),
  alertThreshold: z.number().int().min(0).max(100).default(80).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  categoryId: z.string().optional().nullable(),
  alertThreshold: z.number().int().min(0).max(100).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Investment validation schemas

export const addInvestmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum([
    "STOCKS",
    "BONDS",
    "FIXED_DEPOSIT",
    "NPS",
    "PF",
    "GOLD",
    "MUTUAL_FUNDS",
    "CRYPTO",
    "REAL_ESTATE",
    "OTHER",
  ]),
  symbol: z.string().optional().nullable(),
  quantity: z.number().positive("Quantity must be positive"),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  currentPrice: z
    .number()
    .positive("Current price must be positive")
    .optional()
    .nullable(),
  purchaseDate: z.string().or(z.date()),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateInvestmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z
    .enum([
      "STOCKS",
      "BONDS",
      "FIXED_DEPOSIT",
      "NPS",
      "PF",
      "GOLD",
      "MUTUAL_FUNDS",
      "CRYPTO",
      "REAL_ESTATE",
      "OTHER",
    ])
    .optional(),
  symbol: z.string().optional().nullable(),
  quantity: z.number().positive("Quantity must be positive").optional(),
  purchasePrice: z
    .number()
    .positive("Purchase price must be positive")
    .optional(),
  currentPrice: z
    .number()
    .positive("Current price must be positive")
    .optional()
    .nullable(),
  purchaseDate: z.string().or(z.date()).optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Goal validation schemas

export const addGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z.number().positive("Target amount must be positive"),
  targetDate: z.string().or(z.date()),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  targetAmount: z
    .number()
    .positive("Target amount must be positive")
    .optional(),
  targetDate: z.string().or(z.date()).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Asset validation schemas

export const addAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["PROPERTY", "VEHICLE", "JEWELRY", "ELECTRONICS", "OTHER"]),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchaseValue: z.number().min(0, "Purchase value must be non-negative"),
  purchaseDate: z.string().or(z.date()),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z
    .enum(["PROPERTY", "VEHICLE", "JEWELRY", "ELECTRONICS", "OTHER"])
    .optional(),
  currentValue: z
    .number()
    .min(0, "Current value must be non-negative")
    .optional(),
  purchaseValue: z
    .number()
    .min(0, "Purchase value must be non-negative")
    .optional(),
  purchaseDate: z.string().or(z.date()).optional(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
