"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function BudgetCard({ budgets }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Month Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No budgets set for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => {
        const percentage = budget.percentage || 0;
        const spent = budget.spent || 0;
        const remaining = budget.remaining || Number(budget.amount);

        return (
          <Card key={budget.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {budget.category?.name || "Overall Budget"}
                </CardTitle>
                {getStatusIcon(percentage)}
              </div>
              {budget.description && (
                <p className="text-xs text-muted-foreground mt-1">{budget.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">
                    {formatCurrency(spent)} / {formatCurrency(Number(budget.amount))}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn("h-2", getProgressColor(percentage))}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage}% used</span>
                  <span>
                    {remaining >= 0
                      ? `${formatCurrency(remaining)} remaining`
                      : `${formatCurrency(Math.abs(remaining))} over budget`}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <Link
                  href={`/budgets/edit/${budget.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

