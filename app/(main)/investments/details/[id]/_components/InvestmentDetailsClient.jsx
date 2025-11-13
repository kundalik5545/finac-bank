"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useRouter } from "next/navigation";
import { Edit, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InvestmentDetailsClient({ investment }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
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

  return (
    <div className="container mx-auto max-w-5xl px-2 md:px-0 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
        <Button
          onClick={() => router.push(`/investments/edit/${investment.id}`)}
        >
          <Edit className="mr-2" size={16} />
          Edit
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {investment.name}
              </CardTitle>
              {investment.symbol && (
                <p className="text-sm text-muted-foreground mt-1">
                  Symbol: {investment.symbol}
                </p>
              )}
            </div>
            <Badge className={getTypeColor(investment.type)}>
              {investment.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invested Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(invested)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gain/Loss</p>
              <div className="flex items-center gap-2">
                {isGain ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <p
                  className={`text-2xl font-bold ${
                    isGain
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(Math.abs(gainLoss))}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {gainLossPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p
                className={`text-2xl font-bold ${
                  isGain
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {gainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="text-lg font-semibold">{quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="text-lg font-semibold">
                {formatCurrency(purchasePrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg font-semibold">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Date</p>
              <p className="text-lg font-semibold">
                {formatDate(investment.purchaseDate)}
              </p>
            </div>
            {investment.category && (
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">
                  {investment.category.name}
                </p>
              </div>
            )}
            {investment.subCategory && (
              <div>
                <p className="text-sm text-muted-foreground">Sub Category</p>
                <p className="text-lg font-semibold">
                  {investment.subCategory.name}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {investment.description && (
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-base">{investment.description}</p>
            </div>
          )}

          {/* Notes */}
          {investment.notes && (
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-base">{investment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
