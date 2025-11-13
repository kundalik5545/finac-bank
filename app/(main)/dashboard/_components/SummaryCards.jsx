"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
} from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function SummaryCards({ summary }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: "Total Expense (This Month)",
      value: formatCurrency(summary.totalExpense || 0),
      icon: ArrowDownCircle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Total Income (This Month)",
      value: formatCurrency(summary.totalIncome || 0),
      icon: ArrowUpCircle,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Savings / Leftover",
      value: formatCurrency(summary.savings || 0),
      icon: summary.savings >= 0 ? TrendingUp : TrendingDown,
      color: summary.savings >= 0 ? "text-green-500" : "text-red-500",
      bgColor:
        summary.savings >= 0
          ? "bg-green-100 dark:bg-green-900"
          : "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Biggest Spending Category",
      value: summary.biggestCategory?.name || "N/A",
      subtitle: summary.biggestCategory
        ? formatCurrency(summary.biggestCategory.amount)
        : "",
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Budget Used %",
      value: `${summary.budgetUsedPercent || 0}%`,
      subtitle: summary.totalBudget > 0
        ? `${formatCurrency(summary.budgetUsed)} / ${formatCurrency(summary.totalBudget)}`
        : "No budget set",
      icon: Target,
      color:
        summary.budgetUsedPercent >= 100
          ? "text-red-500"
          : summary.budgetUsedPercent >= 80
          ? "text-yellow-500"
          : "text-green-500",
      bgColor:
        summary.budgetUsedPercent >= 100
          ? "bg-red-100 dark:bg-red-900"
          : summary.budgetUsedPercent >= 80
          ? "bg-yellow-100 dark:bg-yellow-900"
          : "bg-green-100 dark:bg-green-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              {card.subtitle && (
                <div className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

