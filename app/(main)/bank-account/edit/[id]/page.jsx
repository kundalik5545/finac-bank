import { notFound } from "next/navigation";
import EditBankAccountForm from "./_components/EditBankAccountForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

export default async function EditBankAccountPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const account = await prisma.bankAccount.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!account) {
    notFound();
  }

  return <EditBankAccountForm account={account} />;
}

