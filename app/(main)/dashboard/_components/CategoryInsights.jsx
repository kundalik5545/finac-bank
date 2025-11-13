"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { TrendingUp, TrendingDown } from "lucide-react";

export function CategoryInsights({ data, categoryName }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No insights data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    currentMonth: {
      label: "Current Month",
      color: "hsl(var(--chart-1))",
    },
    lastMonth: {
      label: "Last Month",
      color: "hsl(var(--chart-2))",
    },
  };

  const chartData = [
    {
      period: "Current",
      value: data.currentMonth,
      label: "Current Month",
    },
    {
      period: "Last",
      value: data.lastMonth,
      label: "Last Month",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Category Insights{categoryName ? `: ${categoryName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Current Month</div>
            <div className="text-lg font-semibold">
              {formatCurrency(data.currentMonth)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Average (6 months)</div>
            <div className="text-lg font-semibold">
              {formatCurrency(data.averageSpend)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Highest Month</div>
            <div className="text-lg font-semibold">
              {formatCurrency(data.highestMonth)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Lowest Month</div>
            <div className="text-lg font-semibold">
              {formatCurrency(data.lowestMonth)}
            </div>
          </div>
        </div>

        {/* Change from last month */}
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          {data.changeFromLastMonth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm">
            <span className="font-semibold">
              {Math.abs(data.changeFromLastMonth)}%
            </span>{" "}
            {data.changeFromLastMonth >= 0 ? "increase" : "decrease"} from last month
          </span>
        </div>

        {/* Comparison Chart */}
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                  return `₹${value}`;
                }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{data.label}</div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: payload[0].color }}
                            />
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(data.value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

