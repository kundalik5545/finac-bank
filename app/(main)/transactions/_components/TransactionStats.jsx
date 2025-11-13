"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
} from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export function TransactionStats({ stats }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Transactions",
      value: stats.totalCount || 0,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Income",
      value: formatCurrency(stats.totalIncome || 0),
      icon: ArrowUpCircle,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Total Expense",
      value: formatCurrency(stats.totalExpense || 0),
      icon: ArrowDownCircle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Net Amount",
      value: formatCurrency(stats.netAmount || 0),
      icon: stats.netAmount >= 0 ? TrendingUp : TrendingDown,
      color: stats.netAmount >= 0 ? "text-green-500" : "text-red-500",
      bgColor:
        stats.netAmount >= 0
          ? "bg-green-100 dark:bg-green-900"
          : "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Total Transfer",
      value: formatCurrency(stats.totalTransfer || 0),
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Investment",
      value: formatCurrency(stats.totalInvestment || 0),
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type */}
        {stats.byType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">By Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{type}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(data.sum || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count || 0} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Status */}
        {stats.byStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">By Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm">{status}</span>
                    <span className="text-sm font-semibold">{count || 0}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Payment Method */}
        {stats.byPaymentMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">By Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byPaymentMethod).map(([method, data]) => (
                  <div key={method} className="flex justify-between items-center">
                    <span className="text-sm">{method}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(data.sum || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count || 0} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Range */}
        {stats.dateRange && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.dateRange.min && (
                  <div>
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="text-sm font-semibold">
                      {new Date(stats.dateRange.min).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}
                {stats.dateRange.max && (
                  <div>
                    <div className="text-xs text-muted-foreground">To</div>
                    <div className="text-sm font-semibold">
                      {new Date(stats.dateRange.max).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

