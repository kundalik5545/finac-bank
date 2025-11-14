"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

/**
 * Fetches the latest budget progress from the API (or server action).
 * Replace this with your actual API endpoint or server action.
 */
async function fetchBudgetProgress() {
  // NOTE: Replace with your actual fetch/server action as needed
  try {
    const res = await fetch("/api/analytics/budget-progress", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch budget progress");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function BudgetProgress({ data }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [liveData, setLiveData] = useState(data);

  // Poll for updates every 15 seconds - so transactions will always be reflected here soon after they're added
  useEffect(() => {
    let cancelled = false;

    async function updateBudgetProgress() {
      const updated = await fetchBudgetProgress();
      if (!cancelled && updated) {
        setLiveData(updated);
      }
    }

    // Initial update when mounted (if user just added transaction, get latest budget)
    updateBudgetProgress();

    // Poll every 15 seconds
    const interval = setInterval(updateBudgetProgress, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Show fallback if nothing at all
  if (
    !liveData ||
    !liveData.overall ||
    typeof liveData.overall.budgetAmount !== "number" ||
    liveData.overall.budgetAmount === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No budget set for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overall, categories } = liveData;

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Budget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Budget</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(overall.spent)} /{" "}
              {formatCurrency(overall.budgetAmount)}
            </span>
          </div>
          <Progress
            value={Math.min(overall.percentage, 100)}
            className={cn("h-2", getProgressColor(overall.percentage))}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{overall.percentage}% used</span>
            <span>
              {overall.remaining >= 0
                ? `${formatCurrency(overall.remaining)} remaining`
                : `${formatCurrency(Math.abs(overall.remaining))} over budget`}
            </span>
          </div>
        </div>

        {/* Category Budgets */}
        {categories && categories.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">By Category</h4>
            {categories.map((category) => (
              <div
                key={category.budgetId || category.categoryId}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {category.categoryColor && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.categoryColor }}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {category.categoryName}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(category.spent)} /{" "}
                    {formatCurrency(category.budgetAmount)}
                  </span>
                </div>
                <Progress
                  value={Math.min(category.percentage, 100)}
                  className={cn("h-2", getProgressColor(category.percentage))}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{category.percentage}% used</span>
                  <span>
                    {category.remaining >= 0
                      ? `${formatCurrency(category.remaining)} remaining`
                      : `${formatCurrency(
                          Math.abs(category.remaining)
                        )} over budget`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
