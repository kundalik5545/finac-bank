import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import TransactionDetailsClient from "./_components/TransactionDetailsClient";

export default async function TransactionDetailsPage({ params }) {
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
    include: {
      bankAccount: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  return <TransactionDetailsClient transaction={transaction} />;
}
