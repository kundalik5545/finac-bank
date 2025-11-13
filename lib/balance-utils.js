import prisma from "@/db/db.config";

/**
 * Calculate balance change for a transaction
 * @param {Object} transaction - Transaction object
 * @returns {number} - Balance change (positive for income, negative for expense)
 */
export function calculateBalanceChange(transaction) {
  if (!transaction || transaction.status !== "COMPLETED" || !transaction.isActive) {
    return 0;
  }

  const amount = Number(transaction.amount);

  switch (transaction.type) {
    case "INCOME":
      return amount; // Increase balance
    case "EXPENSE":
      return -amount; // Decrease balance
    case "INVESTMENT":
      return -amount; // Decrease balance (money going out)
    case "TRANSFER":
      // TRANSFER needs special handling - subtract from source account
      // Destination account handling should be done separately
      return -amount; // Subtract from source account
    default:
      return 0;
  }
}

/**
 * Update bank account balance based on transaction
 * @param {string} bankAccountId - Bank account ID
 * @param {number} balanceChange - Amount to add/subtract
 * @param {Object} prismaClient - Prisma client (defaults to prisma, can be transaction client)
 * @returns {Promise<void>}
 */
async function updateAccountBalance(bankAccountId, balanceChange, prismaClient = prisma) {
  if (!bankAccountId || balanceChange === 0) {
    return;
  }

  await prismaClient.bankAccount.update({
    where: { id: bankAccountId },
    data: {
      balance: {
        increment: balanceChange,
      },
    },
  });
}

/**
 * Revert a transaction's balance impact
 * @param {Object} transaction - Transaction to revert
 * @param {Object} prismaClient - Prisma client (defaults to prisma, can be transaction client)
 * @returns {Promise<void>}
 */
export async function revertBalanceChange(transaction, prismaClient = prisma) {
  if (!transaction) return;

  const balanceChange = calculateBalanceChange(transaction);
  if (balanceChange === 0) return;

  // Revert by applying opposite change
  await updateAccountBalance(transaction.bankAccountId, -balanceChange, prismaClient);
}

/**
 * Apply a transaction's balance impact
 * @param {Object} transaction - Transaction to apply
 * @param {Object} prismaClient - Prisma client (defaults to prisma, can be transaction client)
 * @returns {Promise<void>}
 */
export async function applyBalanceChange(transaction, prismaClient = prisma) {
  if (!transaction) return;

  const balanceChange = calculateBalanceChange(transaction);
  if (balanceChange === 0) return;

  await updateAccountBalance(transaction.bankAccountId, balanceChange, prismaClient);
}

/**
 * Update bank balance when transaction is created, updated, or deleted
 * Handles all scenarios including status changes, amount changes, type changes, and account changes
 * @param {Object} newTransaction - New/updated transaction data
 * @param {Object} oldTransaction - Old transaction data (null for create, undefined for delete)
 * @param {string} operation - 'create', 'update', or 'delete'
 * @param {Object} prismaClient - Prisma client (defaults to prisma, can be transaction client)
 * @returns {Promise<void>}
 */
export async function updateBankBalance(newTransaction, oldTransaction, operation, prismaClient = prisma) {
  try {
    if (operation === "create") {
      // New transaction - apply if COMPLETED
      if (newTransaction && newTransaction.status === "COMPLETED" && newTransaction.isActive) {
        await applyBalanceChange(newTransaction, prismaClient);
      }
    } else if (operation === "update") {
      // Updated transaction - need to handle changes
      if (!oldTransaction || !newTransaction) return;

      const oldBalanceChange = calculateBalanceChange(oldTransaction);
      const newBalanceChange = calculateBalanceChange(newTransaction);

      // If bank account changed, revert from old account and apply to new account
      if (oldTransaction.bankAccountId !== newTransaction.bankAccountId) {
        // Revert from old account
        if (oldBalanceChange !== 0) {
          await updateAccountBalance(oldTransaction.bankAccountId, -oldBalanceChange, prismaClient);
        }
        // Apply to new account
        if (newBalanceChange !== 0) {
          await updateAccountBalance(newTransaction.bankAccountId, newBalanceChange, prismaClient);
        }
      } else {
        // Same account - calculate net change
        const netChange = newBalanceChange - oldBalanceChange;
        if (netChange !== 0) {
          await updateAccountBalance(newTransaction.bankAccountId, netChange, prismaClient);
        }
      }
    } else if (operation === "delete") {
      // Deleted transaction - revert if it was COMPLETED
      if (oldTransaction && oldTransaction.status === "COMPLETED" && oldTransaction.isActive) {
        await revertBalanceChange(oldTransaction, prismaClient);
      }
    }
  } catch (error) {
    console.error("Error updating bank balance:", error);
    throw error;
  }
}

/**
 * Recalculate account balance from all completed transactions
 * Useful for fixing inconsistencies or data migration
 * Note: This assumes opening balance is 0 or was added as a transaction
 * @param {string} bankAccountId - Bank account ID
 * @param {Object} prismaClient - Prisma client (defaults to prisma, can be transaction client)
 * @returns {Promise<number>} - Calculated balance
 */
export async function recalculateAccountBalance(bankAccountId, prismaClient = prisma) {
  try {
    // Get all completed, active transactions for this account
    const transactions = await prismaClient.transaction.findMany({
      where: {
        bankAccountId,
        status: "COMPLETED",
        isActive: true,
      },
      select: {
        amount: true,
        type: true,
      },
    });

    // Calculate balance from transactions
    let calculatedBalance = 0;
    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      switch (tx.type) {
        case "INCOME":
          calculatedBalance += amount;
          break;
        case "EXPENSE":
        case "INVESTMENT":
          calculatedBalance -= amount;
          break;
        case "TRANSFER":
          // TRANSFER subtracts from source account
          calculatedBalance -= amount;
          break;
      }
    });

    // Update account balance
    await prismaClient.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        balance: calculatedBalance,
      },
    });

    return calculatedBalance;
  } catch (error) {
    console.error("Error recalculating account balance:", error);
    throw error;
  }
}

