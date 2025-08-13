"use server";

import prisma from "@/db/db.config";
import { revalidatePath } from "next/cache";

export async function addBankAccount(formData) {
  try {
    await prisma.bankAccount.create({
      data: {
        bankName: formData.get("bankName"),
        userId: formData.get("userId"),
        accountNumber: formData.get("accountNumber") || null,
        iFSC_Code: formData.get("iFSC_Code") || null,
        branch: formData.get("branch") || null,
        openingBalance: parseFloat(formData.get("openingBalance") || "0"),
        accountType: formData.get("accountType"),
        statuses: formData.get("statuses"),
        currency: formData.get("currency"),
        isPrimary: formData.get("isPrimary") === "on",
        comments: formData.get("comments") || null,
      },
    });

    revalidatePath("/bank-account");
  } catch (error) {
    console.error("Error adding bank account:", error);
    throw error;
  }
}

export async function addBankAccount2(formData) {
  try {
    await prisma.bankAccount.create({
      data: {
        bankName: formData.bankName,
        userId: formData.userId,
        accountNumber: formData.accountNumber || null,
        iFSC_Code: formData.iFSC_Code || null,
        branch: formData.branch || null,
        openingBalance: parseFloat(formData.openingBalance || "0"),
        accountType: formData.accountType,
        statuses: formData.statuses,
        currency: formData.currency,
        isPrimary: formData.isPrimary === "on",
        comments: formData.comments || null,
      },
    });

    revalidatePath("/bank-account");
  } catch (error) {
    console.error("Error adding bank account:", error);
    throw error;
  }
}
