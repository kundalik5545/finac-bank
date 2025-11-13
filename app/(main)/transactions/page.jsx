import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import TransactionsClient from "./_components/TransactionsClient";

export default async function TransactionPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  // Fetch bank accounts and categories for filters,
  // and ensure that no select item will have an empty string as the value.
  const [bankAccounts, categories] = await Promise.all([
    prisma.bankAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        // Prevent possible empty name selection (defensive, though id is always present)
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

  // Filter out any items with empty string ids from bankAccounts and categories
  // (Defensive; in normal usage, Prisma should not return such items,
  // but this ensures downstream <SelectItem value={...} /> is not passed "")
  const validBankAccounts = bankAccounts.filter(
    (account) => account.id && account.id !== ""
  );
  const validCategories = categories.filter(
    (category) => category.id && category.id !== ""
  );

  return (
    <TransactionsClient
      initialBankAccounts={validBankAccounts}
      initialCategories={validCategories}
    />
  );
}
