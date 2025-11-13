import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // Calculate current amount from all investments
    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate total current value of investments
    let currentAmount = 0;
    investments.forEach((investment) => {
      const currentPrice = Number(investment.currentPrice || investment.purchasePrice);
      const currentValue = Number(investment.quantity) * currentPrice;
      currentAmount += currentValue;
    });

    // Also include assets
    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
      },
    });

    assets.forEach((asset) => {
      currentAmount += Number(asset.currentValue);
    });

    const targetAmount = Number(goal.targetAmount);
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = Math.max(0, targetAmount - currentAmount);
    const daysRemaining = Math.ceil(
      (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      goal,
      progress: {
        currentAmount,
        targetAmount,
        remaining,
        progressPercent: Math.min(100, Math.max(0, progress)),
        daysRemaining,
        isCompleted: currentAmount >= targetAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal progress" },
      { status: 500 }
    );
  }
}

