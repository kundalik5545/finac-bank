"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

export function InvestmentStatsCards({ stats, summary }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();

  const getTypeColor = (type) => {
    const colors = {
      STOCKS: "bg-blue-500",
      BONDS: "bg-green-500",
      FIXED_DEPOSIT: "bg-yellow-500",
      NPS: "bg-purple-500",
      PF: "bg-indigo-500",
      GOLD: "bg-amber-500",
      MUTUAL_FUNDS: "bg-pink-500",
      CRYPTO: "bg-orange-500",
      REAL_ESTATE: "bg-red-500",
      OTHER: "bg-gray-500",
    };
    return colors[type] || colors.OTHER;
  };

  const handleTypeClick = (type) => {
    router.push(`/investments/type/${type}`);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalInvested)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalCurrentValue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gain/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {summary.totalGainLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <p
                  className={`text-2xl font-bold ${
                    summary.totalGainLoss >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(Math.abs(summary.totalGainLoss))}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.totalGainLossPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Type-specific Cards */}
      {stats && stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">By Investment Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const isGain = stat.totalGainLoss >= 0;
              return (
                <Card
                  key={stat.type}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTypeClick(stat.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {stat.type.replace(/_/g, " ")}
                      </CardTitle>
                      <div
                        className={`w-3 h-3 rounded-full ${getTypeColor(
                          stat.type
                        )}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Value
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(stat.totalCurrentValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Gain/Loss
                        </p>
                        <div className="flex items-center gap-1">
                          {isGain ? (
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                          <p
                            className={`text-sm font-semibold ${
                              isGain
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatCurrency(Math.abs(stat.totalGainLoss))} (
                            {stat.gainLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.count} investment{stat.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
