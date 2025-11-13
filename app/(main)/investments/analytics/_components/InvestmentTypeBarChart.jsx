"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function InvestmentTypeBarChart({ stats }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Comparison</CardTitle>
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
    invested: stat.totalInvested,
    current: stat.totalCurrentValue,
    gainLoss: stat.totalGainLoss,
  }));

  const chartConfig = {
    invested: {
      label: "Invested",
      color: "hsl(var(--chart-1))",
    },
    current: {
      label: "Current Value",
      color: "hsl(var(--chart-2))",
    },
    gainLoss: {
      label: "Gain/Loss",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Comparison by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium">{entry.name}:</span>
                            <span className="font-semibold">
                              {formatCurrency(entry.value || 0)}
                            </span>
                          </div>
                        ))}
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="invested" fill="hsl(var(--chart-1))" />
              <Bar dataKey="current" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

