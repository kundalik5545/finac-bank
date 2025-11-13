"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSubCategorySchema, updateSubCategorySchema } from "@/lib/formSchema";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";
import { IconSelector } from "./IconSelector";

export default function SubCategoryForm({ subCategory = null, categoryId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!subCategory;
  const schema = isEdit ? updateSubCategorySchema : addSubCategorySchema;

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
      categoryId: categoryId || "",
      color: null,
      icon: null,
    },
  });

  useEffect(() => {
    if (subCategory) {
      reset({
        name: subCategory.name,
        color: subCategory.color || null,
        icon: subCategory.icon || null,
      });
    } else if (categoryId) {
      setValue("categoryId", categoryId);
    }
  }, [subCategory, categoryId, reset, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/categories/${categoryId}/subcategories/${subCategory.id}`
        : `/api/categories/${categoryId}/subcategories`;
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          color: data.color,
          icon: data.icon,
        }),
      });

      if (response.ok) {
        toast.success(
          isEdit
            ? "Subcategory updated successfully"
            : "Subcategory created successfully"
        );
        router.push("/categories");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save subcategory");
      }
    } catch (error) {
      toast.error("Failed to save subcategory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEdit ? "Edit Subcategory" : "Add Subcategory"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Subcategory Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter subcategory name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
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
                  ? "Update Subcategory"
                  : "Create Subcategory"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

