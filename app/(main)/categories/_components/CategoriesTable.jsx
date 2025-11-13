"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash, Edit, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { renderIcon } from "./IconSelector";
import { Badge } from "@/components/ui/badge";
import React from "react";

export function CategoriesTable({ categories }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

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
    router.push(`/categories/${categoryId}/subcategories/edit/${subCategoryId}`);
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

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[800px]"}>
        <TableCaption>A list of all your categories and subcategories.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-sm"></TableHead>
            <TableHead className="text-sm">Icon</TableHead>
            <TableHead className="text-sm">Name</TableHead>
            <TableHead className="hidden md:table-cell text-sm">Type</TableHead>
            <TableHead className="text-sm">Color</TableHead>
            <TableHead className="text-sm">Subcategories</TableHead>
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories?.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const subCategoriesCount = category.subCategories?.length || 0;

            return (
              <React.Fragment key={category.id}>
                <TableRow>
                  <TableCell className="text-sm">
                    {subCategoriesCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {category.icon && renderIcon(category.icon, "w-5 h-5")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    <Badge className={getTypeColor(category.type)}>
                      {category.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {category.color && (
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {subCategoriesCount} {subCategoriesCount === 1 ? "item" : "items"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSubCategory(category.id)}
                        title="Add subcategory"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category.id)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(category.id, category.name)
                        }
                        disabled={loadingStates[`delete-${category.id}`]}
                      >
                        <Trash
                          size={16}
                          className="text-red-500"
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded &&
                  category.subCategories?.map((subCategory) => (
                    <TableRow
                      key={subCategory.id}
                      className="bg-gray-50 dark:bg-gray-900/50"
                    >
                      <TableCell></TableCell>
                      <TableCell className="text-sm pl-8">
                        {subCategory.icon &&
                          renderIcon(subCategory.icon, "w-4 h-4")}
                      </TableCell>
                      <TableCell className="text-sm pl-8">
                        <span className="text-muted-foreground">
                          └ {subCategory.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm"></TableCell>
                      <TableCell className="text-sm">
                        {subCategory.color && (
                          <div
                            className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: subCategory.color }}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm"></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleEditSubCategory(
                                category.id,
                                subCategory.id
                              )
                            }
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteSubCategory(
                                category.id,
                                subCategory.id,
                                subCategory.name
                              )
                            }
                            disabled={
                              loadingStates[`delete-sub-${subCategory.id}`]
                            }
                          >
                            <Trash
                              size={14}
                              className="text-red-500"
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            );
          })}
          {(!categories || categories.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No categories found. Create your first category to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

