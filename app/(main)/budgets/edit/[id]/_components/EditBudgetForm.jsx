"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BudgetForm } from "../../../_components/BudgetForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EditBudgetForm({ initialBudget, categories }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData = {
    amount: Number(initialBudget.amount),
    month: initialBudget.month,
    year: initialBudget.year,
    categoryId: initialBudget.categoryId || "",
    alertThreshold: initialBudget.alertThreshold || 80,
    description: initialBudget.description || "",
    isActive: initialBudget.isActive,
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/budgets/${initialBudget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Budget updated successfully");
        router.push("/budgets");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update budget");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to update budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm
            initialData={initialData}
            categories={categories}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

