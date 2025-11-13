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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addInvestmentSchema } from "@/lib/formSchema";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const investmentTypes = [
  "STOCKS",
  "BONDS",
  "FIXED_DEPOSIT",
  "NPS",
  "PF",
  "GOLD",
  "MUTUAL_FUNDS",
  "CRYPTO",
  "REAL_ESTATE",
  "OTHER",
];

export default function AddInvestmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(addInvestmentSchema),
    defaultValues: {
      type: "STOCKS",
      quantity: 1,
      purchasePrice: 0,
      currentPrice: 0,
    },
  });

  const investmentType = watch("type");

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?type=INVESTMENT");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch subcategories when category is selected
    if (selectedCategoryId) {
      const fetchSubCategories = async () => {
        try {
          const response = await fetch(
            `/api/categories/${selectedCategoryId}/subcategories`
          );
          if (response.ok) {
            const data = await response.json();
            setSubCategories(data.subCategories || []);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategoryId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Investment created successfully");
        router.push("/investments");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create investment");
      }
    } catch (error) {
      toast.error("Failed to create investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Investment Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Reliance Industries"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Investment Type *</Label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue="STOCKS"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Symbol (for stocks, crypto) */}
            {(investmentType === "STOCKS" || investmentType === "CRYPTO") && (
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  {...register("symbol")}
                  placeholder="e.g., RELIANCE, BTC"
                />
                {errors.symbol && (
                  <p className="text-sm text-red-500">
                    {errors.symbol.message}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register("purchasePrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-500">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>

            {/* Current Price */}
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price (Optional)</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                {...register("currentPrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.currentPrice && (
                <p className="text-sm text-red-500">
                  {errors.currentPrice.message}
                </p>
              )}
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate")}
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-500">
                  {errors.purchaseDate.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category (Optional)</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedCategoryId(value);
                  setValue("categoryId", value === "none" ? null : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories
                    .filter((cat) => cat.id && cat.id !== "")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Category */}
            {selectedCategoryId && selectedCategoryId !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="subCategoryId">Sub Category (Optional)</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("subCategoryId", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subCategories
                      .filter((sub) => sub.id && sub.id !== "")
                      .map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Private notes..."
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Investment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
