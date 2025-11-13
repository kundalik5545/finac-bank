"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Button } from "@/components/ui/button";

export function MonthlyTrendChart({ data }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [visibleLines, setVisibleLines] = useState({
    expense: true,
    income: true,
    savings: true,
  });

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    expense: {
      label: "Expense",
      color: "hsl(var(--chart-1))",
    },
    income: {
      label: "Income",
      color: "hsl(var(--chart-2))",
    },
    savings: {
      label: "Savings",
      color: "hsl(var(--chart-3))",
    },
  };

  const toggleLine = (key) => {
    setVisibleLines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Trend Analysis</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={visibleLines.expense ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine("expense")}
            >
              Expense
            </Button>
            <Button
              variant={visibleLines.income ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine("income")}
            >
              Income
            </Button>
            <Button
              variant={visibleLines.savings ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine("savings")}
            >
              Savings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
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
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{payload[0].payload.month}</div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {entry.name}:
                              </span>
                              <span className="text-sm font-semibold">
                                {formatCurrency(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {visibleLines.expense && (
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Expense"
                />
              )}
              {visibleLines.income && (
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Income"
                />
              )}
              {visibleLines.savings && (
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Savings"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

