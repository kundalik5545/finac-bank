"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function GoalProgressCards({ goals }) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => {
        const progress = goalProgress[goal.id] || {
          currentAmount: 0,
          targetAmount: Number(goal.targetAmount),
          progressPercent: 0,
          daysRemaining: 0,
          isCompleted: false,
        };

        const progressPercent = Math.min(100, Math.max(0, progress.progressPercent));

        return (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{goal.name}</CardTitle>
                {progress.isCompleted && (
                  <Badge className="bg-green-500">Completed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold">
                      {progressPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-semibold">
                      {formatCurrency(progress.currentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold">
                      {formatCurrency(progress.targetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-semibold">
                      {formatCurrency(Math.max(0, progress.targetAmount - progress.currentAmount))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

