"use server";

import prisma from "@/db/db.config";
import { revalidatePath } from "next/cache";

export async function getGoals(userId) {
  try {
    const goals = await prisma.goal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw new Error("Error while fetching goals");
  }
}

export async function getGoalProgress(userId, goalId) {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    // Calculate current amount from all investments
    const investments = await prisma.investment.findMany({
      where: {
        userId,
      },
    });

    // Calculate total current value of investments
    let currentAmount = 0;
    investments.forEach((investment) => {
      const currentPrice = Number(
        investment.currentPrice || investment.purchasePrice
      );
      const currentValue = Number(investment.quantity) * currentPrice;
      currentAmount += currentValue;
    });

    // Also include assets
    const assets = await prisma.asset.findMany({
      where: {
        userId,
      },
    });

    assets.forEach((asset) => {
      currentAmount += Number(asset.currentValue);
    });

    const targetAmount = Number(goal.targetAmount);
    const progress =
      targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = Math.max(0, targetAmount - currentAmount);
    const daysRemaining = Math.ceil(
      (new Date(goal.targetDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      goal,
      progress: {
        currentAmount,
        targetAmount,
        remaining,
        progressPercent: Math.min(100, Math.max(0, progress)),
        daysRemaining,
        isCompleted: currentAmount >= targetAmount,
      },
    };
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    throw new Error("Error while fetching goal progress");
  }
}

export async function calculateGoalContributions(goalId) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    // Get all investments and assets for the user
    const investments = await prisma.investment.findMany({
      where: {
        userId: goal.userId,
      },
      include: {
        category: true,
        subCategory: true,
      },
    });

    const assets = await prisma.asset.findMany({
      where: {
        userId: goal.userId,
      },
    });

    // Calculate contributions
    const investmentContributions = investments.map((investment) => {
      const currentPrice = Number(
        investment.currentPrice || investment.purchasePrice
      );
      const currentValue = Number(investment.quantity) * currentPrice;
      return {
        id: investment.id,
        name: investment.name,
        type: "INVESTMENT",
        value: currentValue,
        investmentType: investment.type,
      };
    });

    const assetContributions = assets.map((asset) => {
      return {
        id: asset.id,
        name: asset.name,
        type: "ASSET",
        value: Number(asset.currentValue),
        assetType: asset.type,
      };
    });

    const totalValue =
      investmentContributions.reduce((sum, item) => sum + item.value, 0) +
      assetContributions.reduce((sum, item) => sum + item.value, 0);

    return {
      goal,
      contributions: [...investmentContributions, ...assetContributions],
      totalValue,
      targetAmount: Number(goal.targetAmount),
      progress: (totalValue / Number(goal.targetAmount)) * 100,
    };
  } catch (error) {
    console.error("Error calculating goal contributions:", error);
    throw new Error("Error while calculating goal contributions");
  }
}
