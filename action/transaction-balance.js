"use server";

import prisma from "@/db/db.config";
import { updateBankBalance, recalculateAccountBalance } from "@/lib/balance-utils";
import { revalidatePath } from "next/cache";

/**
 * Update balance for a specific transaction
 * @param {string} transactionId - Transaction ID
 * @param {string} operation - 'create', 'update', or 'delete'
 * @returns {Promise<void>}
 */
export async function updateTransactionBalance(transactionId, operation) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        amount: true,
        type: true,
        status: true,
        bankAccountId: true,
        isActive: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await updateBankBalance(transaction, null, operation);
    
    // Revalidate paths
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/bank-account");
  } catch (error) {
    console.error("Error updating transaction balance:", error);
    throw error;
  }
}

/**
 * Recalculate account balance from all completed transactions
 * Useful for fixing inconsistencies or data migration
 * @param {string} bankAccountId - Bank account ID
 * @returns {Promise<number>} - Calculated balance
 */
export async function recalculateAccountBalanceAction(bankAccountId) {
  try {
    const balance = await recalculateAccountBalance(bankAccountId);
    
    // Revalidate paths
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/bank-account");
    
    return balance;
  } catch (error) {
    console.error("Error recalculating account balance:", error);
    throw error;
  }
}

