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
