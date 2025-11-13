import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import EditTransactionForm from "./_components/EditTransactionForm";

export default async function EditTransactionPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!transaction) {
    notFound();
  }

  // Fetch bank accounts and categories for the form
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
    <EditTransactionForm
      transaction={transaction}
      bankAccounts={bankAccounts}
      categories={categories}
    />
  );
}

