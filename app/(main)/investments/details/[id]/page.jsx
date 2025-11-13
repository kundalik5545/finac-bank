import { notFound } from "next/navigation";
import InvestmentDetailsClient from "./_components/InvestmentDetailsClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

export default async function InvestmentDetailsPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const investment = await prisma.investment.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      category: true,
      subCategory: true,
    },
  });

  if (!investment) {
    notFound();
  }

  return <InvestmentDetailsClient investment={investment} />;
}
