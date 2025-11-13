"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Edit, Trash, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function InvestmentsCard({ investments }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});

  const getTypeColor = (type) => {
    const colors = {
      STOCKS: "bg-blue-500",
      BONDS: "bg-green-500",
      FIXED_DEPOSIT: "bg-yellow-500",
      NPS: "bg-purple-500",
      PF: "bg-indigo-500",
      GOLD: "bg-amber-500",
      MUTUAL_FUNDS: "bg-pink-500",
      CRYPTO: "bg-orange-500",
      REAL_ESTATE: "bg-red-500",
      OTHER: "bg-gray-500",
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

  const handleEdit = (investmentId, e) => {
    e.stopPropagation();
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investments.map((investment) => {
        const purchasePrice = Number(investment.purchasePrice);
        const currentPrice = Number(
          investment.currentPrice || investment.purchasePrice
        );
        const quantity = Number(investment.quantity);
        const invested = purchasePrice * quantity;
        const currentValue = currentPrice * quantity;
        const gainLoss = currentValue - invested;
        const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;
        const isGain = gainLoss >= 0;

        return (
          <Card
            key={investment.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleView(investment.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{investment.name}</CardTitle>
                  {investment.symbol && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {investment.symbol}
                    </p>
                  )}
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${getTypeColor(
                    investment.type
                  )}`}
                />
              </div>
              <Badge variant="outline" className="mt-2">
                {investment.type.replace(/_/g, " ")}
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gain/Loss</p>
                    <p
                      className={`text-sm font-semibold flex items-center gap-1 ${
                        isGain
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isGain ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {formatCurrency(Math.abs(gainLoss))} (
                      {gainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(investment.id);
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEdit(investment.id, e)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(investment.id, investment.name);
                    }}
                    disabled={loadingStates[`delete-${investment.id}`]}
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
