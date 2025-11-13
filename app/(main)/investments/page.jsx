import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { InvestmentsClient } from "./_components/InvestmentsClient";
import { InvestmentStatsCards } from "./_components/InvestmentStatsCards";
import { getInvestmentStats } from "@/action/investment";

const InvestmentsPage = async () => {
  let investments = [];
  let stats = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      investments = await prisma.investment.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          category: true,
          subCategory: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      stats = await getInvestmentStats(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching investments:", error);
    investments = [];
    stats = null;
  }

  // Calculate total current value
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const currentPrice = Number(inv.currentPrice || inv.purchasePrice);
    return sum + Number(inv.quantity) * currentPrice;
  }, 0);

  return (
    <div className="investments-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Investments
          </h1>
          {totalCurrentValue > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total Current Value: ₹
              {totalCurrentValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href="/investments/analytics"
              className="flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Analytics
            </Link>
          </Button>
          <Button>
            <Link
              href="/investments/add"
              className="flex items-center justify-around"
            >
              <Plus size={16} /> Add Investment
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Cards Section */}
      {stats && stats.stats.length > 0 && (
        <section className="py-5">
          <InvestmentStatsCards stats={stats.stats} summary={stats.summary} />
        </section>
      )}

      {/* Investments List Section */}
      <section className="py-5">
        <InvestmentsClient investments={investments} />
      </section>
    </div>
  );
};

export default InvestmentsPage;
