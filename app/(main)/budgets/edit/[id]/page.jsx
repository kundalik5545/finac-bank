import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBudgetById } from "@/action/budget";
import prisma from "@/db/db.config";
import { EditBudgetForm } from "./_components/EditBudgetForm";

export default async function EditBudgetPage({ params }) {
  let budget = null;
  let categories = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      const { id } = await params;
      budget = await getBudgetById(id, session.user.id);

      categories = await prisma.category.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: [
          {
            position: "asc",
          },
          {
            name: "asc",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error fetching budget:", error);
  }

  if (!budget) {
    return (
      <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-8">
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Budget not found</p>
        </div>
      </div>
    );
  }

  return <EditBudgetForm initialBudget={budget} categories={categories} />;
}

