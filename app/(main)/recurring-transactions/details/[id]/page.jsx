import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { notFound } from "next/navigation";
import RecurringTransactionDetails from "./_components/RecurringTransactionDetails";

export default async function RecurringTransactionDetailsPage({ params }) {
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
      transactions: {
        orderBy: {
          date: "desc",
        },
        take: 10,
      },
    },
  });

  if (!recurringTransaction) {
    return notFound();
  }

  return <RecurringTransactionDetails recurringTransaction={recurringTransaction} />;
}

