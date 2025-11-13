import { notFound } from "next/navigation";
import EditGoalForm from "./_components/EditGoalForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

export default async function EditGoalPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const goal = await prisma.goal.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!goal) {
    notFound();
  }

  return <EditGoalForm goal={goal} />;
}

