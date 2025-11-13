"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BudgetTable({ budgets }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [deletingId, setDeletingId] = useState(null);

  if (!budgets || budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground border rounded-lg">
        No budgets found
      </div>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleDelete = async (budgetId) => {
    if (!confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    setDeletingId(budgetId);
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Budget deleted successfully");
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    } finally {
      setDeletingId(null);
    }
  };

  const getMonthName = (month) => {
    if (!month) return "N/A";
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Month/Year</TableHead>
            <TableHead>Budget Amount</TableHead>
            <TableHead>Spent</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const percentage = budget.percentage || 0;
            const spent = budget.spent || 0;
            const remaining = budget.remaining || Number(budget.amount);

            return (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {budget.category?.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                    )}
                    {budget.category?.name || "Overall Budget"}
                  </div>
                </TableCell>
                <TableCell>
                  {getMonthName(budget.month)} {budget.year}
                </TableCell>
                <TableCell>{formatCurrency(Number(budget.amount))}</TableCell>
                <TableCell>{formatCurrency(spent)}</TableCell>
                <TableCell
                  className={cn(
                    remaining >= 0 ? "text-green-600" : "text-red-600 font-semibold"
                  )}
                >
                  {remaining >= 0
                    ? formatCurrency(remaining)
                    : `-${formatCurrency(Math.abs(remaining))}`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={cn("h-2 flex-1", getProgressColor(percentage))}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href={`/budgets/edit/${budget.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(budget.id)}
                      disabled={deletingId === budget.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

