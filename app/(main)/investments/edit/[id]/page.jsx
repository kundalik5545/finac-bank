import { notFound } from "next/navigation";
import EditInvestmentForm from "./_components/EditInvestmentForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

export default async function EditInvestmentPage({ params }) {
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

  return <EditInvestmentForm investment={investment} />;
}
