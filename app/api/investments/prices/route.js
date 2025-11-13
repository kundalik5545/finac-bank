import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateAllPrices } from "@/lib/price-service";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all investments that can have prices updated
    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
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

    return NextResponse.json({
      message: "Prices updated successfully",
      results,
      updated: updatePromises.length,
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
