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
import { Edit, Trash, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function InvestmentsTable({ investments }) {
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
      STOCKS: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      BONDS:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      FIXED_DEPOSIT:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      NPS: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      PF: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
      GOLD: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
      MUTUAL_FUNDS:
        "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200",
      CRYPTO:
        "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      REAL_ESTATE: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      OTHER: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
    };
    return colors[type] || colors.OTHER;
  };

  const handleDelete = async (investmentId, investmentName) => {
    if (!confirm(`Are you sure you want to delete "${investmentName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${investmentId}`]: true }));

    try {
      const response = await fetch(`/api/investments/${investmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Investment deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete investment");
      }
    } catch (error) {
      toast.error("Failed to delete investment");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${investmentId}`]: false,
      }));
    }
  };

  const handleEdit = (investmentId) => {
    router.push(`/investments/edit/${investmentId}`);
  };

  const handleView = (investmentId) => {
    router.push(`/investments/details/${investmentId}`);
  };

  if (!investments || investments.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No investments found. Add your first investment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[1000px]"}>
        <TableCaption>
          Showing {investments.length} investment
          {investments.length !== 1 ? "s" : ""}
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">Name</TableHead>
            <TableHead className="text-sm">Type</TableHead>
            {!isMobile && <TableHead className="text-sm">Symbol</TableHead>}
            <TableHead className="text-sm">Quantity</TableHead>
            {!isMobile && (
              <TableHead className="text-sm">Purchase Price</TableHead>
            )}
            <TableHead className="text-sm">Current Price</TableHead>
            <TableHead className="text-right text-sm">Current Value</TableHead>
            <TableHead className="text-right text-sm">Gain/Loss</TableHead>
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {investments.map((investment) => {
            const purchasePrice = Number(investment.purchasePrice);
            const currentPrice = Number(
              investment.currentPrice || investment.purchasePrice
            );
            const quantity = Number(investment.quantity);
            const invested = purchasePrice * quantity;
            const currentValue = currentPrice * quantity;
            const gainLoss = currentValue - invested;
            const gainLossPercent =
              invested > 0 ? (gainLoss / invested) * 100 : 0;
            const isGain = gainLoss >= 0;

            return (
              <TableRow
                key={investment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(investment.id)}
              >
                <TableCell className="text-sm">
                  <div>
                    <div className="font-medium">{investment.name}</div>
                    {isMobile && investment.symbol && (
                      <div className="text-xs text-muted-foreground">
                        {investment.symbol}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <Badge className={getTypeColor(investment.type)}>
                    {investment.type.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    {investment.symbol || "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm">{quantity}</TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    {formatCurrency(purchasePrice)}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  {formatCurrency(currentPrice)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {formatCurrency(currentValue)}
                </TableCell>
                <TableCell
                  className={`text-right text-sm font-semibold ${
                    isGain
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    {isGain ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {formatCurrency(Math.abs(gainLoss))} (
                      {gainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(investment.id)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(investment.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDelete(investment.id, investment.name)
                      }
                      disabled={loadingStates[`delete-${investment.id}`]}
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
