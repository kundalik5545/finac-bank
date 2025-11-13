import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addBudgetSchema } from "@/lib/formSchema";
import { createBudget, getBudgets } from "@/action/budget";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")) : undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const isActive = searchParams.get("isActive") !== null ? searchParams.get("isActive") === "true" : undefined;

    const filters = {
      month,
      year,
      categoryId,
      isActive,
    };

    const budgets = await getBudgets(session.user.id, filters);

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

    return NextResponse.json({ budgets: budgetsWithProgress }, { status: 200 });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle empty string categoryId - convert to null
    if (body.categoryId === "" || body.categoryId === "none") {
      body.categoryId = null;
    }
    
    const validatedData = addBudgetSchema.parse(body);

    const budget = await createBudget({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }

    if (error.message && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Return more detailed error message
    return NextResponse.json({ 
      error: "Failed to create budget",
      message: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
}

