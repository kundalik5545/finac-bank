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
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AssetsTable({ assets }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      PROPERTY: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      VEHICLE: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      JEWELRY: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      ELECTRONICS: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      OTHER: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
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

  const handleEdit = (assetId) => {
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
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[800px]"}>
        <TableCaption>
          Showing {assets.length} asset{assets.length !== 1 ? "s" : ""}
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">Name</TableHead>
            <TableHead className="text-sm">Type</TableHead>
            {!isMobile && <TableHead className="text-sm">Purchase Date</TableHead>}
            {!isMobile && <TableHead className="text-sm">Purchase Value</TableHead>}
            <TableHead className="text-right text-sm">Current Value</TableHead>
            <TableHead className="text-right text-sm">Gain/Loss</TableHead>
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {assets.map((asset) => {
            const purchaseValue = Number(asset.purchaseValue);
            const currentValue = Number(asset.currentValue);
            const gainLoss = currentValue - purchaseValue;
            const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
            const isGain = gainLoss >= 0;

            return (
              <TableRow key={asset.id} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium">
                  {asset.name}
                </TableCell>
                <TableCell className="text-sm">
                  <Badge className={getTypeColor(asset.type)}>
                    {asset.type}
                  </Badge>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    {formatDate(asset.purchaseDate)}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    {formatCurrency(purchaseValue)}
                  </TableCell>
                )}
                <TableCell className="text-right text-sm font-semibold">
                  {formatCurrency(currentValue)}
                </TableCell>
                <TableCell className={`text-right text-sm font-semibold ${isGain ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  <div className="flex items-center justify-end gap-1">
                    {isGain ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {formatCurrency(Math.abs(gainLoss))} ({gainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(asset.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(asset.id, asset.name)}
                      disabled={loadingStates[`delete-${asset.id}`]}
                    >
                      <Trash size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

