"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RecurringExpensesChart({ data }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Expenses Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No recurring expenses found
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    monthlyAmount: {
      label: "Monthly Amount",
      color: "hsl(var(--chart-1))",
    },
  };

  // Prepare data for chart (top 10 by monthly amount)
  const chartData = data
    .slice(0, 10)
    .map((item) => ({
      name: item.description || "Recurring Expense",
      monthlyAmount: item.monthlyAmount,
      frequency: item.frequency,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recurring Expenses Tracker</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/recurring-transactions">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
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
                          <div className="font-medium">{data.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="text-sm text-muted-foreground">Monthly:</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(data.monthlyAmount)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Frequency: {data.frequency}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="monthlyAmount"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            Total Monthly:{" "}
            <span className="font-semibold">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.monthlyAmount, 0)
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

