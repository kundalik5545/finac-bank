import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvestmentStats } from "@/action/investment";
import { getGoals } from "@/action/goal";
import { InvestmentStatsOverview } from "./_components/InvestmentStatsOverview";
import { GoalProgressCards } from "./_components/GoalProgressCards";
import { InvestmentDistributionChart } from "./_components/InvestmentDistributionChart";
import { InvestmentTypeBarChart } from "./_components/InvestmentTypeBarChart";
import { GoalProgressChart } from "./_components/GoalProgressChart";

export default async function InvestmentAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  let investmentStats = null;
  let goals = [];

  try {
    [investmentStats, goals] = await Promise.all([
      getInvestmentStats(session.user.id),
      getGoals(session.user.id),
    ]);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    // Set defaults on error
    investmentStats = {
      stats: [],
      summary: {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalCount: 0,
      },
    };
    goals = [];
  }

  return (
    <div className="analytics-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-6">
      <section>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
          Investment Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your investment performance and progress toward your financial goals.
        </p>
      </section>

      {/* Stats Overview */}
      {investmentStats && (
        <section>
          <InvestmentStatsOverview summary={investmentStats.summary} />
        </section>
      )}

      {/* Goal Progress Cards */}
      {goals && goals.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Goal Progress</h2>
          <GoalProgressCards goals={goals} />
        </section>
      )}

      {/* Charts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Investment Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {investmentStats && investmentStats.stats.length > 0 && (
            <>
              <InvestmentDistributionChart stats={investmentStats.stats} />
              <InvestmentTypeBarChart stats={investmentStats.stats} />
            </>
          )}
        </div>
      </section>

      {/* Goal Progress Chart */}
      {goals && goals.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Goal Progress Overview</h2>
          <GoalProgressChart goals={goals} />
        </section>
      )}
    </div>
  );
}

