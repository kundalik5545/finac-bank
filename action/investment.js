"use server";

import prisma from "@/db/db.config";
import { revalidatePath } from "next/cache";
import { updateAllPrices } from "@/lib/price-service";

export async function getInvestments(userId, filters = {}) {
  try {
    const where = {
      userId,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const investments = await prisma.investment.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return investments;
  } catch (error) {
    console.error("Error fetching investments:", error);
    // Return empty array on error instead of throwing
    return [];
  }
}

export async function getInvestmentStats(userId) {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        userId,
      },
    });

    // Calculate stats by type
    const statsByType = {};
    let totalInvested = 0;
    let totalCurrentValue = 0;

    investments.forEach((investment) => {
      const type = investment.type;
      const invested =
        Number(investment.quantity) * Number(investment.purchasePrice);
      const currentPrice = Number(
        investment.currentPrice || investment.purchasePrice
      );
      const currentValue = Number(investment.quantity) * currentPrice;
      const gainLoss = currentValue - invested;

      if (!statsByType[type]) {
        statsByType[type] = {
          type,
          count: 0,
          totalInvested: 0,
          totalCurrentValue: 0,
          totalGainLoss: 0,
        };
      }

      statsByType[type].count += 1;
      statsByType[type].totalInvested += invested;
      statsByType[type].totalCurrentValue += currentValue;
      statsByType[type].totalGainLoss += gainLoss;

      totalInvested += invested;
      totalCurrentValue += currentValue;
    });

    // Calculate percentages for each type
    const stats = Object.values(statsByType).map((stat) => ({
      ...stat,
      gainLossPercent:
        stat.totalInvested > 0
          ? (stat.totalGainLoss / stat.totalInvested) * 100
          : 0,
    }));

    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      stats,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
        totalCount: investments.length,
      },
    };
  } catch (error) {
    console.error("Error fetching investment stats:", error);
    // Return empty stats on error instead of throwing
    return {
      stats: [],
      summary: {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalCount: 0,
      },
    };
  }
}

export async function getInvestmentByType(userId, type) {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        type,
      },
      include: {
        category: true,
        subCategory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate type-specific stats
    let totalInvested = 0;
    let totalCurrentValue = 0;

    investments.forEach((investment) => {
      const invested =
        Number(investment.quantity) * Number(investment.purchasePrice);
      const currentPrice = Number(
        investment.currentPrice || investment.purchasePrice
      );
      const currentValue = Number(investment.quantity) * currentPrice;

      totalInvested += invested;
      totalCurrentValue += currentValue;
    });

    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      investments,
      stats: {
        type,
        count: investments.length,
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
      },
    };
  } catch (error) {
    console.error("Error fetching investments by type:", error);
    // Return empty data on error instead of throwing
    return {
      investments: [],
      stats: {
        type,
        count: 0,
        totalInvested: 0,
        totalCurrentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      },
    };
  }
}

export async function updateInvestmentPrices(userId) {
  try {
    // Fetch all investments that can have prices updated
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        type: {
          in: ["STOCKS", "GOLD", "CRYPTO"],
        },
      },
    });

    // Update prices
    const results = await updateAllPrices(investments);

    // Update database with new prices
    const updatePromises = results
      .filter((r) => r.success && r.newPrice !== null)
      .map((r) =>
        prisma.investment.update({
          where: { id: r.investmentId },
          data: { currentPrice: r.newPrice },
        })
      );

    await Promise.all(updatePromises);

    revalidatePath("/investments");
    revalidatePath("/investments/analytics");

    return {
      success: true,
      updated: updatePromises.length,
      results,
    };
  } catch (error) {
    console.error("Error updating investment prices:", error);
    // Return error result instead of throwing
    return {
      success: false,
      updated: 0,
      results: [],
      error: error.message,
    };
  }
}
