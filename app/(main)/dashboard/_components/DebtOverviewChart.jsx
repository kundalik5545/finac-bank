"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function DebtOverviewChart({ data }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt / EMI Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No debt/EMI data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for stacked bar chart
  const chartData = data.map((category) => ({
    category: category.categoryName,
    monthlyAmount: category.monthlyAmount,
    count: category.count,
    categoryColor: category.categoryColor,
  }));

  const chartConfig = data.reduce((acc, item, index) => {
    acc[`category_${index}`] = {
      label: item.categoryName,
      color: item.categoryColor || "#8884d8",
    };
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt / EMI Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
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
                    const payloadData = payload[0].payload;
                    const categoryInfo = data.find((item) => item.categoryName === payloadData.category);
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{payloadData.category}</div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="text-sm text-muted-foreground">Monthly:</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(payloadData.monthlyAmount)}
                            </span>
                          </div>
                          {categoryInfo && (
                            <div className="text-xs text-muted-foreground">
                              {categoryInfo.count} item{categoryInfo.count !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="monthlyAmount"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                name="Monthly Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            Total Monthly Commitments:{" "}
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

