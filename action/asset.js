"use server";

import prisma from "@/db/db.config";
import { revalidatePath } from "next/cache";

export async function getAssets(userId) {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Error while fetching assets");
  }
}

export async function getAssetStats(userId) {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId,
      },
    });

    // Calculate stats by type
    const statsByType = {};
    let totalCurrentValue = 0;
    let totalPurchaseValue = 0;

    assets.forEach((asset) => {
      const type = asset.type;
      const currentValue = Number(asset.currentValue);
      const purchaseValue = Number(asset.purchaseValue);
      const gainLoss = currentValue - purchaseValue;

      if (!statsByType[type]) {
        statsByType[type] = {
          type,
          count: 0,
          totalCurrentValue: 0,
          totalPurchaseValue: 0,
          totalGainLoss: 0,
        };
      }

      statsByType[type].count += 1;
      statsByType[type].totalCurrentValue += currentValue;
      statsByType[type].totalPurchaseValue += purchaseValue;
      statsByType[type].totalGainLoss += gainLoss;

      totalCurrentValue += currentValue;
      totalPurchaseValue += purchaseValue;
    });

    // Calculate percentages for each type
    const stats = Object.values(statsByType).map((stat) => ({
      ...stat,
      gainLossPercent:
        stat.totalPurchaseValue > 0
          ? (stat.totalGainLoss / stat.totalPurchaseValue) * 100
          : 0,
    }));

    const totalGainLoss = totalCurrentValue - totalPurchaseValue;
    const totalGainLossPercent =
      totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;

    return {
      stats,
      summary: {
        totalCurrentValue,
        totalPurchaseValue,
        totalGainLoss,
        totalGainLossPercent,
        totalCount: assets.length,
      },
    };
  } catch (error) {
    console.error("Error fetching asset stats:", error);
    throw new Error("Error while fetching asset stats");
  }
}
