"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
];

export function InvestmentDistributionChart({ stats }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No investment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = stats.map((stat) => ({
    name: stat.type.replace(/_/g, " "),
    value: stat.totalCurrentValue,
  }));

  const chartConfig = {
    value: {
      label: "Value",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Distribution by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <ChartTooltipContent>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.payload.fill }}
                          />
                          <span className="font-medium">{data.name}</span>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(data.value || 0)}
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

