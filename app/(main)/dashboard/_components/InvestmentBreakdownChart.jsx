"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function InvestmentBreakdownChart() {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  // Mock data structure for UI placeholder
  const mockData = [
    { name: "Mutual Funds", value: 0, color: "#8884d8" },
    { name: "FD", value: 0, color: "#82ca9d" },
    { name: "RD", value: 0, color: "#ffc658" },
    { name: "Stocks", value: 0, color: "#ff7300" },
    { name: "Crypto", value: 0, color: "#00ff00" },
  ];

  const chartConfig = mockData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.color,
    };
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings & Investment Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Coming Soon</p>
            <p className="text-sm">
              Investment tracking will be available in a future update.
            </p>
          </div>
          {/* Placeholder chart structure */}
          <ChartContainer config={chartConfig} className="h-[200px] opacity-30">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

