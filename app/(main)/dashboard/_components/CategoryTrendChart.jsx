"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Button } from "@/components/ui/button";

export function CategoryTrendChart({ data: trendData }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!trendData || !trendData.data || trendData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No category trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data, categories } = trendData;

  // Compute initial state based on categories
  const initialVisibleCategories = useMemo(() => {
    const initial = {};
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        initial[cat.id] = true;
      });
    }
    return initial;
  }, [categories]);

  const [visibleCategories, setVisibleCategories] = useState(initialVisibleCategories);
  const categoriesIdsRef = useRef(categories?.map((c) => c.id).join(",") || "");

  // Update state when categories change (only if category IDs actually changed)
  useEffect(() => {
    const currentIds = categories?.map((c) => c.id).join(",") || "";
    if (categories && categories.length > 0 && currentIds !== categoriesIdsRef.current) {
      categoriesIdsRef.current = currentIds;
      setVisibleCategories((prev) => {
        const newInitial = {};
        categories.forEach((cat) => {
          // Preserve existing visibility if category already exists, otherwise default to true
          newInitial[cat.id] = prev[cat.id] !== undefined ? prev[cat.id] : true;
        });
        return newInitial;
      });
    }
  }, [categories]);

  const chartConfig = categories.reduce((acc, cat) => {
    acc[cat.id] = {
      label: cat.name,
      color: cat.color || "#8884d8",
    };
    return acc;
  }, {});

  const toggleCategory = (categoryId) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Category Trend Over Time</CardTitle>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={visibleCategories[cat.id] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(cat.id)}
                style={{
                  backgroundColor: visibleCategories[cat.id] ? cat.color : undefined,
                  borderColor: cat.color,
                }}
              >
                {cat.name}
              </Button>
            ))}
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
                          {payload.map((entry, index) => {
                            const category = categories.find((cat) => cat.id === entry.dataKey);
                            if (!category || !visibleCategories[category.id]) return null;
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {category.name}:
                                </span>
                                <span className="text-sm font-semibold">
                                  {formatCurrency(entry.value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {categories.map((cat) => {
                if (!visibleCategories[cat.id]) return null;
                return (
                  <Line
                    key={cat.id}
                    type="monotone"
                    dataKey={cat.id}
                    stroke={cat.color || "#8884d8"}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={cat.name}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

