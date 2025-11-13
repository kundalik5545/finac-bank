import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { notFound } from "next/navigation";
import EditRecurringTransactionForm from "./_components/EditRecurringTransactionForm";

export default async function EditRecurringTransactionPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return notFound();
  }

  const { id } = await params;

  const recurringTransaction = await prisma.recurringTransaction.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      bankAccount: true,
      category: true,
    },
  });

  if (!recurringTransaction) {
    return notFound();
  }

  // Fetch bank accounts and categories
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

  return (
    <EditRecurringTransactionForm
      recurringTransaction={recurringTransaction}
      bankAccounts={bankAccounts}
      categories={categories}
    />
  );
}

