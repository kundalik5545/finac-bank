"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BudgetForm } from "../_components/BudgetForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddBudgetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Normalize categoryId - convert empty string or "none" to null
      const normalizedValues = {
        ...values,
        categoryId: values.categoryId === "" || values.categoryId === "none" ? null : values.categoryId,
      };

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedValues),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Budget created successfully");
        router.push("/budgets");
        router.refresh();
      } else {
        // Show detailed error message
        const errorMessage = data.message || data.error || "Failed to create budget";
        if (data.details) {
          console.error("Validation errors:", data.details);
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error(error.message || "Failed to create budget");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-8">
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm categories={categories} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

