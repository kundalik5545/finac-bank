"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AssetsCard({ assets }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});

  const getTypeColor = (type) => {
    const colors = {
      PROPERTY: "bg-blue-500",
      VEHICLE: "bg-green-500",
      JEWELRY: "bg-yellow-500",
      ELECTRONICS: "bg-purple-500",
      OTHER: "bg-gray-500",
    };
    return colors[type] || colors.OTHER;
  };

  const handleDelete = async (assetId, assetName) => {
    if (!confirm(`Are you sure you want to delete "${assetName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${assetId}`]: true }));

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Asset deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete asset");
      }
    } catch (error) {
      toast.error("Failed to delete asset");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${assetId}`]: false }));
    }
  };

  const handleEdit = (assetId, e) => {
    e.stopPropagation();
    router.push(`/assets/edit/${assetId}`);
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">No assets found. Add your first asset to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => {
        const purchaseValue = Number(asset.purchaseValue);
        const currentValue = Number(asset.currentValue);
        const gainLoss = currentValue - purchaseValue;
        const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
        const isGain = gainLoss >= 0;

        return (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{asset.name}</CardTitle>
                <div
                  className={`w-3 h-3 rounded-full ${getTypeColor(asset.type)}`}
                />
              </div>
              <Badge variant="outline" className="mt-2">
                {asset.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gain/Loss</p>
                  <div className="flex items-center gap-1">
                    {isGain ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <p
                      className={`text-sm font-semibold ${
                        isGain
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(gainLoss))} ({gainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEdit(asset.id, e)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset.id, asset.name);
                    }}
                    disabled={loadingStates[`delete-${asset.id}`]}
                  >
                    <Trash size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

