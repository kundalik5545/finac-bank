"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { renderIcon } from "./IconSelector";

export function CategoriesCard({ categories }) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});

  const handleDelete = async (categoryId, categoryName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This will also delete all subcategories.`
      )
    ) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${categoryId}`]: true }));

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${categoryId}`]: false,
      }));
    }
  };

  const handleDeleteSubCategory = async (
    categoryId,
    subCategoryId,
    subCategoryName
  ) => {
    if (!confirm(`Are you sure you want to delete "${subCategoryName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      [`delete-sub-${subCategoryId}`]: true,
    }));

    try {
      const response = await fetch(
        `/api/categories/${categoryId}/subcategories/${subCategoryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Subcategory deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete subcategory");
      }
    } catch (error) {
      toast.error("Failed to delete subcategory");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-sub-${subCategoryId}`]: false,
      }));
    }
  };

  const handleEdit = (categoryId) => {
    router.push(`/categories/edit/${categoryId}`);
  };

  const handleAddSubCategory = (categoryId) => {
    router.push(`/categories/${categoryId}/subcategories/add`);
  };

  const handleEditSubCategory = (categoryId, subCategoryId) => {
    router.push(
      `/categories/${categoryId}/subcategories/edit/${subCategoryId}`
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "INCOME":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "EXPENSE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "TRANSFER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "INVESTMENT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">No categories found.</p>
        <p className="text-sm mt-2">
          Create your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => {
        const subCategories = category.subCategories || [];

        return (
          <Card key={category.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {category.icon && (
                    <div className="text-3xl">
                      {renderIcon(category.icon, "w-10 h-10")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {category.name}
                    </CardTitle>
                    <Badge className={`mt-1 ${getTypeColor(category.type)}`}>
                      {category.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddSubCategory(category.id)}
                    title="Add subcategory"
                    className="h-8 w-8 p-0"
                  >
                    <Plus size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category.id)}
                    title="Edit category"
                    className="h-8 w-8 p-0"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={loadingStates[`delete-${category.id}`]}
                    title="Delete category"
                    className="h-8 w-8 p-0"
                  >
                    <Trash size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
              {category.color && (
                <div className="mt-2">
                  <div
                    className="w-full h-2 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-2">
              {subCategories.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Subcategories ({subCategories.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subCategories.map((subCategory) => (
                      <Badge
                        key={subCategory.id}
                        variant="outline"
                        className="flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity group"
                        style={{
                          borderColor: subCategory.color || "currentColor",
                          backgroundColor: subCategory.color
                            ? `${subCategory.color}20`
                            : undefined,
                        }}
                        onClick={() =>
                          handleEditSubCategory(category.id, subCategory.id)
                        }
                      >
                        {subCategory.icon && (
                          <span className="text-lg flex-shrink-0">
                            {renderIcon(subCategory.icon, "w-12 h-12")}
                          </span>
                        )}
                        <span className="flex-shrink-0">
                          {subCategory.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubCategory(
                              category.id,
                              subCategory.id,
                              subCategory.name
                            );
                          }}
                          disabled={
                            loadingStates[`delete-sub-${subCategory.id}`]
                          }
                          className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete subcategory"
                        >
                          <Trash size={10} className="text-red-500" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  <p>No subcategories</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
