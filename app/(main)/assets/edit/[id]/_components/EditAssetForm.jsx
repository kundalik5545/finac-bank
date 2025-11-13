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
import { updateAssetSchema } from "@/lib/formSchema";
import { useState } from "react";
import { toast } from "sonner";

const assetTypes = ["PROPERTY", "VEHICLE", "JEWELRY", "ELECTRONICS", "OTHER"];

export default function EditAssetForm({ asset }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: {
      name: asset.name,
      type: asset.type,
      currentValue: Number(asset.currentValue),
      purchaseValue: Number(asset.purchaseValue),
      purchaseDate: new Date(asset.purchaseDate).toISOString().split("T")[0],
      description: asset.description || "",
      notes: asset.notes || "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Asset updated successfully");
        router.push("/assets");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update asset");
      }
    } catch (error) {
      toast.error("Failed to update asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., My Car"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={asset.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Current Value */}
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value *</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                {...register("currentValue", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.currentValue && (
                <p className="text-sm text-red-500">
                  {errors.currentValue.message}
                </p>
              )}
            </div>

            {/* Purchase Value */}
            <div className="space-y-2">
              <Label htmlFor="purchaseValue">Purchase Value *</Label>
              <Input
                id="purchaseValue"
                type="number"
                step="0.01"
                {...register("purchaseValue", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.purchaseValue && (
                <p className="text-sm text-red-500">
                  {errors.purchaseValue.message}
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
                {isSubmitting ? "Updating..." : "Update Asset"}
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

