import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBudgets } from "@/action/budget";
import prisma from "@/db/db.config";
import { BudgetTable } from "./_components/BudgetTable";
import { BudgetCard } from "./_components/BudgetCard";

const BudgetsPage = async () => {
  let budgets = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      budgets = await getBudgets(session.user.id, {
        month: currentMonth,
        year: currentYear,
      });

      // Calculate progress for each budget
      const budgetsWithProgress = await Promise.all(
        budgets.map(async (budget) => {
          const budgetMonth = budget.month;
          const budgetYear = budget.year;

          if (!budgetMonth || !budgetYear) {
            return {
              ...budget,
              spent: 0,
              remaining: Number(budget.amount),
              percentage: 0,
            };
          }

          const startDate = new Date(budgetYear, budgetMonth - 1, 1);
          const endDate = new Date(budgetYear, budgetMonth, 0, 23, 59, 59);

          const transactions = await prisma.transaction.findMany({
            where: {
              userId: session.user.id,
              status: "COMPLETED",
              isActive: true,
              type: "EXPENSE",
              date: {
                gte: startDate,
                lte: endDate,
              },
              ...(budget.categoryId && { categoryId: budget.categoryId }),
            },
          });

          const spent = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
          const budgetAmount = Number(budget.amount);
          const remaining = budgetAmount - spent;
          const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

          return {
            ...budget,
            spent,
            remaining,
            percentage,
          };
        })
      );

      budgets = budgetsWithProgress;
    }
  } catch (error) {
    console.error("Error fetching budgets:", error);
  }

  return (
    <div className="budgets-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your monthly budgets and track spending
          </p>
        </div>
        <Button className="flex">
          <Link href="/budgets/add" className="flex items-center justify-around">
            <Plus size={16} className="mr-2" /> Add Budget
          </Link>
        </Button>
      </section>

      {/* Budget Cards */}
      <section className="py-5">
        <BudgetCard budgets={budgets} />
      </section>

      {/* Budget Table */}
      <section className="py-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold py-1">All Budgets</h2>
        <BudgetTable budgets={budgets} />
      </section>
    </div>
  );
};

export default BudgetsPage;

