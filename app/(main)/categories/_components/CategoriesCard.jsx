"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit, Plus, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { renderIcon } from "./IconSelector";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableCategoryCard({ category, onDelete, onEdit, onAddSubCategory, onEditSubCategory, onDeleteSubCategory, loadingStates, getTypeColor }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const subCategories = category.subCategories || [];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`flex flex-col ${isDragging ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
              title="Drag to reorder"
            >
              <GripVertical size={18} className="text-muted-foreground" />
            </div>
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
              onClick={() => onAddSubCategory(category.id)}
              title="Add subcategory"
              className="h-8 w-8 p-0"
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category.id)}
              title="Edit category"
              className="h-8 w-8 p-0"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id, category.name)}
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
                    onEditSubCategory(category.id, subCategory.id)
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
                      onDeleteSubCategory(
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
}

export function CategoriesCard({ categories: initialCategories }) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});
  const [categories, setCategories] = useState(initialCategories);
  const [activeId, setActiveId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  // Sync categories when prop changes (e.g., after refresh)
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      const previousCategories = categories; // Store previous state for rollback
      setCategories(newCategories);
      setIsReordering(true);

      try {
        const reorderData = newCategories.map((cat, index) => ({
          id: cat.id,
          position: index + 1,
        }));

        const response = await fetch("/api/categories/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reorderData),
        });

        if (response.ok) {
          toast.success("Category order saved");
          router.refresh();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to save category order");
          // Revert to previous order on error
          setCategories(previousCategories);
        }
      } catch (error) {
        console.error("Error reordering categories:", error);
        toast.error("Failed to save category order");
        // Revert to previous order on error
        setCategories(previousCategories);
      } finally {
        setIsReordering(false);
      }
    }
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

  const activeCategory = activeId
    ? categories.find((cat) => cat.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((cat) => cat.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <SortableCategoryCard
              key={category.id}
              category={category}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAddSubCategory={handleAddSubCategory}
              onEditSubCategory={handleEditSubCategory}
              onDeleteSubCategory={handleDeleteSubCategory}
              loadingStates={loadingStates}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeCategory ? (
          <Card className="flex flex-col opacity-90 rotate-3 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical size={18} className="text-muted-foreground" />
                  {activeCategory.icon && (
                    <div className="text-3xl">
                      {renderIcon(activeCategory.icon, "w-10 h-10")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {activeCategory.name}
                    </CardTitle>
                    <Badge className={`mt-1 ${getTypeColor(activeCategory.type)}`}>
                      {activeCategory.type}
                    </Badge>
                  </div>
                </div>
              </div>
              {activeCategory.color && (
                <div className="mt-2">
                  <div
                    className="w-full h-2 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: activeCategory.color }}
                  />
                </div>
              )}
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
