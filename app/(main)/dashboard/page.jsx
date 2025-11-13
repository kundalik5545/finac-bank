import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getMonthlySummary,
  getExpenseDistribution,
  getMonthlyTrends,
  getCategoryTrends,
  getDailySpendingPattern,
  getCashflowData,
  getBudgetProgress,
  getRecurringExpenses,
  getDebtOverview,
  getCategoryInsights,
} from "@/action/analytics";
import { SummaryCards } from "./_components/SummaryCards";
import { ExpenseDistributionChart } from "./_components/ExpenseDistributionChart";
import { MonthlyTrendChart } from "./_components/MonthlyTrendChart";
import { CategoryTrendChart } from "./_components/CategoryTrendChart";
import { SpendingPatternChart } from "./_components/SpendingPatternChart";
import { CashflowChart } from "./_components/CashflowChart";
import { BudgetProgress } from "./_components/BudgetProgress";
import { RecurringExpensesChart } from "./_components/RecurringExpensesChart";
import { DebtOverviewChart } from "./_components/DebtOverviewChart";
import { InvestmentBreakdownChart } from "./_components/InvestmentBreakdownChart";
import { CategoryInsights } from "./_components/CategoryInsights";
import { NetWorthChart } from "./_components/NetWorthChart";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch all Phase 1 and Phase 2 data in parallel
  const [
    monthlySummary,
    expenseDistribution,
    monthlyTrends,
    categoryTrends,
    dailySpendingPatternWeek,
    dailySpendingPatternMonth,
    cashflowData,
    budgetProgress,
    recurringExpenses,
    debtOverview,
    categoryInsights,
  ] = await Promise.all([
    getMonthlySummary(session.user.id),
    getExpenseDistribution(session.user.id, currentMonth, currentYear),
    getMonthlyTrends(session.user.id, 12),
    getCategoryTrends(session.user.id, [], 12),
    getDailySpendingPattern(session.user.id, currentMonth, currentYear, "dayOfWeek"),
    getDailySpendingPattern(session.user.id, currentMonth, currentYear, "dayOfMonth"),
    getCashflowData(session.user.id, 12),
    getBudgetProgress(session.user.id, currentMonth, currentYear),
    getRecurringExpenses(session.user.id),
    getDebtOverview(session.user.id),
    getCategoryInsights(session.user.id, null), // Overall insights (no specific category)
  ]);

  // Combine both patterns for the component
  const dailySpendingPattern = {
    dayOfWeek: dailySpendingPatternWeek,
    dayOfMonth: dailySpendingPatternMonth,
  };

  return (
    <div className="dashboard-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-6">
      {/* Section 1: Summary Cards */}
      <section>
        <h2 className="text-xl font-bold mb-4">Overview</h2>
        <SummaryCards summary={monthlySummary} />
      </section>

      {/* Section 2: Distribution */}
      <section>
        <h2 className="text-xl font-bold mb-4">Expense Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseDistributionChart data={expenseDistribution} />
        </div>
      </section>

      {/* Section 3: Trends */}
      <section>
        <h2 className="text-xl font-bold mb-4">Trends</h2>
        <div className="grid grid-cols-1 gap-6">
          <MonthlyTrendChart data={monthlyTrends} />
          <CategoryTrendChart data={categoryTrends} />
        </div>
      </section>

      {/* Section 4: Spending Pattern */}
      <section>
        <h2 className="text-xl font-bold mb-4">Spending Pattern</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingPatternChart data={dailySpendingPattern} />
        </div>
      </section>

      {/* Section 5: Cashflow */}
      <section>
        <h2 className="text-xl font-bold mb-4">Cashflow</h2>
        <div className="grid grid-cols-1 gap-6">
          <CashflowChart data={cashflowData} />
        </div>
      </section>

      {/* Section 6: Advanced Features (Phase 2) */}
      <section>
        <h2 className="text-xl font-bold mb-4">Advanced Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetProgress data={budgetProgress} />
          <RecurringExpensesChart data={recurringExpenses} />
        </div>
      </section>

      {/* Section 7: Debt Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4">Debt & Commitments</h2>
        <div className="grid grid-cols-1 gap-6">
          <DebtOverviewChart data={debtOverview} />
        </div>
      </section>

      {/* Section 8: Category Insights */}
      <section>
        <h2 className="text-xl font-bold mb-4">Category Insights</h2>
        <div className="grid grid-cols-1 gap-6">
          <CategoryInsights data={categoryInsights} />
        </div>
      </section>

      {/* Section 9: Investments & Net Worth (UI Only) */}
      <section>
        <h2 className="text-xl font-bold mb-4">Investments & Net Worth</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvestmentBreakdownChart />
          <NetWorthChart />
        </div>
      </section>
    </div>
  );
}
