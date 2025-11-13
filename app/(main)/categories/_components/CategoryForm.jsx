"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCategorySchema, updateCategorySchema } from "@/lib/formSchema";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";
import { IconSelector } from "./IconSelector";

export default function CategoryForm({ category = null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!category;
  const schema = isEdit ? updateCategorySchema : addCategorySchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      color: null,
      icon: null,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        color: category.color || null,
        icon: category.icon || null,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          isEdit
            ? "Category updated successfully"
            : "Category created successfully"
        );
        router.push("/categories");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEdit ? "Edit Category" : "Add Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Category Type</Label>
              <Select
                value={watch("type") || "EXPENSE"}
                onValueChange={(value) => setValue("type", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="INVESTMENT">Investment</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Icon */}
            <IconSelector
              value={watch("icon") || ""}
              onChange={(value) => setValue("icon", value || null)}
            />
            {errors.icon && (
              <p className="text-sm text-red-500">{errors.icon.message}</p>
            )}

            {/* Color */}
            <ColorPicker
              value={watch("color") || ""}
              onChange={(value) => setValue("color", value || null)}
            />
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color.message}</p>
            )}

            {/* Submit & Cancel */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

