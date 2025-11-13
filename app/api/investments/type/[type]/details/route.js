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

    const { type } = await params;

    // Validate investment type
    const validTypes = [
      "STOCKS",
      "BONDS",
      "FIXED_DEPOSIT",
      "NPS",
      "PF",
      "GOLD",
      "MUTUAL_FUNDS",
      "CRYPTO",
      "REAL_ESTATE",
      "OTHER",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid investment type" },
        { status: 400 }
      );
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
        type: type,
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
      const invested = Number(investment.quantity) * Number(investment.purchasePrice);
      const currentPrice = Number(investment.currentPrice || investment.purchasePrice);
      const currentValue = Number(investment.quantity) * currentPrice;

      totalInvested += invested;
      totalCurrentValue += currentValue;
    });

    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 
      ? (totalGainLoss / totalInvested) * 100 
      : 0;

    return NextResponse.json({
      investments,
      stats: {
        type,
        count: investments.length,
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
      },
    });
  } catch (error) {
    console.error("Error fetching investment details by type:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment details" },
      { status: 500 }
    );
  }
}

