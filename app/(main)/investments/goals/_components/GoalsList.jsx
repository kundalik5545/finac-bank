"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function GoalsList({ goals: initialGoals }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [goalProgress, setGoalProgress] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    // Fetch progress for each goal
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

  const handleDelete = async (goalId, goalName) => {
    if (!confirm(`Are you sure you want to delete "${goalName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${goalId}`]: true }));

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete goal");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${goalId}`]: false }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!goals || goals.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No goals found. Add your first goal to get started.
        </p>
      </div>
    );
  }

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

        const progressPercent = Math.min(
          100,
          Math.max(0, progress.progressPercent)
        );

        return (
          <Card key={goal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{goal.name}</CardTitle>
                {progress.isCompleted && (
                  <Badge className="bg-green-500">Completed</Badge>
                )}
                {!goal.isActive && <Badge variant="outline">Inactive</Badge>}
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {goal.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-sm font-semibold">
                    {progressPercent.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-semibold">
                    {formatCurrency(progress.currentAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-semibold">
                    {formatCurrency(progress.targetAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      Math.max(
                        0,
                        progress.targetAmount - progress.currentAmount
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Date:</span>
                  <span className="font-semibold">
                    {formatDate(goal.targetDate)}
                  </span>
                </div>
                {progress.daysRemaining > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Days Remaining:
                    </span>
                    <span className="font-semibold">
                      {progress.daysRemaining}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/investments/goals/edit/${goal.id}`)
                  }
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(goal.id, goal.name)}
                  disabled={loadingStates[`delete-${goal.id}`]}
                >
                  <Trash size={16} className="text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
