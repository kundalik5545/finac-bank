"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useEffect, useState } from "react";

export function GoalProgressChart({ goals }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [goalProgress, setGoalProgress] = useState({});

  useEffect(() => {
    const fetchProgress = async () => {
      const progressData = {};
      for (const goal of goals) {
        try {
          const response = await fetch(`/api/goals/${goal.id}/progress`);
          if (response.ok) {
            const data = await response.json();
            progressData[goal.id] = data.progress;
          }
        } catch (error) {
          console.error(`Error fetching progress for goal ${goal.id}:`, error);
        }
      }
      setGoalProgress(progressData);
    };

    if (goals.length > 0) {
      fetchProgress();
    }
  }, [goals]);

  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No goals found
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = goals.map((goal) => {
    const progress = goalProgress[goal.id] || {
      currentAmount: 0,
      targetAmount: Number(goal.targetAmount),
      progressPercent: 0,
    };
    return {
      name: goal.name,
      current: progress.currentAmount,
      target: progress.targetAmount,
      remaining: Math.max(0, progress.targetAmount - progress.currentAmount),
    };
  });

  const chartConfig = {
    current: {
      label: "Current Amount",
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: "Target Amount",
      color: "hsl(var(--chart-2))",
    },
    remaining: {
      label: "Remaining",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Progress Overview</CardTitle>
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
              <Bar dataKey="current" fill="hsl(var(--chart-1))" />
              <Bar dataKey="target" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

