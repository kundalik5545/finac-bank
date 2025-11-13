"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function NetWorthChart() {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  // Mock data structure for UI placeholder
  const mockData = [
    { month: "Jan", assets: 0, liabilities: 0, netWorth: 0 },
    { month: "Feb", assets: 0, liabilities: 0, netWorth: 0 },
    { month: "Mar", assets: 0, liabilities: 0, netWorth: 0 },
    { month: "Apr", assets: 0, liabilities: 0, netWorth: 0 },
    { month: "May", assets: 0, liabilities: 0, netWorth: 0 },
    { month: "Jun", assets: 0, liabilities: 0, netWorth: 0 },
  ];

  const chartConfig = {
    assets: {
      label: "Assets",
      color: "hsl(var(--chart-2))",
    },
    liabilities: {
      label: "Liabilities",
      color: "hsl(var(--chart-1))",
    },
    netWorth: {
      label: "Net Worth",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Coming Soon</p>
            <p className="text-sm">
              Net worth tracking will be available in a future update when asset and liability tracking is implemented.
            </p>
          </div>
          {/* Placeholder chart structure */}
          <ChartContainer config={chartConfig} className="h-[200px] opacity-30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                    return `₹${value}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="assets"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="liabilities"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

