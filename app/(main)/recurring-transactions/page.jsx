import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import RecurringTransactionsClient from "./_components/RecurringTransactionsClient";

export default async function RecurringTransactionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  // Fetch bank accounts and categories for filters
  const [bankAccounts, categories] = await Promise.all([
    prisma.bankAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  // Filter out any items with empty string ids
  const validBankAccounts = bankAccounts.filter(
    (account) => account.id && account.id !== ""
  );
  const validCategories = categories.filter(
    (category) => category.id && category.id !== ""
  );

  return (
    <RecurringTransactionsClient
      initialBankAccounts={validBankAccounts}
      initialCategories={validCategories}
    />
  );
}

