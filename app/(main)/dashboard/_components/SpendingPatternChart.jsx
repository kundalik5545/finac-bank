"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Button } from "@/components/ui/button";

export function SpendingPatternChart({ data: patternData }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [viewType, setViewType] = useState("dayOfWeek");

  // Handle both old format (array) and new format (object with dayOfWeek/dayOfMonth)
  let dayOfWeekData = [];
  let dayOfMonthData = [];

  if (Array.isArray(patternData)) {
    // Old format - single array
    dayOfWeekData = patternData.filter((item) =>
      ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].includes(
        item.label
      )
    );
    dayOfMonthData = patternData.filter((item) => item.value <= 31);
  } else if (patternData && typeof patternData === "object") {
    // New format - object with dayOfWeek and dayOfMonth
    dayOfWeekData = patternData.dayOfWeek || [];
    dayOfMonthData = patternData.dayOfMonth || [];
  }

  const data = viewType === "dayOfWeek" ? dayOfWeekData : dayOfMonthData;

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily / Weekly Spending Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No spending pattern data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily / Weekly Spending Pattern</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewType === "dayOfWeek" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("dayOfWeek")}
            >
              By Day of Week
            </Button>
            <Button
              variant={viewType === "dayOfMonth" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("dayOfMonth")}
            >
              By Day of Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={viewType === "dayOfMonth" ? -45 : 0}
                textAnchor={viewType === "dayOfMonth" ? "end" : "middle"}
                height={viewType === "dayOfMonth" ? 80 : 40}
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
                          <div className="font-medium">{data.label}</div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(data.amount)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {data.count} transaction{data.count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

