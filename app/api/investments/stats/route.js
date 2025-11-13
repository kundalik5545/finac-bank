import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate stats by type
    const statsByType = {};
    let totalInvested = 0;
    let totalCurrentValue = 0;

    investments.forEach((investment) => {
      const type = investment.type;
      const invested = Number(investment.quantity) * Number(investment.purchasePrice);
      const currentPrice = Number(investment.currentPrice || investment.purchasePrice);
      const currentValue = Number(investment.quantity) * currentPrice;
      const gainLoss = currentValue - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

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
      gainLossPercent: stat.totalInvested > 0 
        ? (stat.totalGainLoss / stat.totalInvested) * 100 
        : 0,
    }));

    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 
      ? (totalGainLoss / totalInvested) * 100 
      : 0;

    return NextResponse.json({
      stats,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
        totalCount: investments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching investment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment stats" },
      { status: 500 }
    );
  }
}

