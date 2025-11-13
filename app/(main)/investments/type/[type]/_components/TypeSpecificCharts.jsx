"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { InvestmentsTable } from "../../../_components/InvestmentsTable";

export default function TypeSpecificCharts({ data, type }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();

  const { investments, stats } = data;

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
      </div>

      <section>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
          {type.replace(/_/g, " ")} Investments
        </h1>
      </section>

      {/* Stats Cards */}
      {stats && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalInvested)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalCurrentValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Gain/Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    stats.totalGainLoss >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(Math.abs(stats.totalGainLoss))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalGainLossPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.count}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Investments List */}
      <section>
        <InvestmentsTable investments={investments} />
      </section>
    </div>
  );
}

