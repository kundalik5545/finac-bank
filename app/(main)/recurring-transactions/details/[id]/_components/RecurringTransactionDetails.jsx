"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecurringTransactionDetails({
  recurringTransaction,
}) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case "DAILY":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "WEEKLY":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "MONTHLY":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "YEARLY":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="recurring-transaction-details container mx-auto max-w-5xl p-3 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/recurring-transactions")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() =>
            router.push(`/recurring-transactions/edit/${recurringTransaction.id}`)
          }
        >
          <Edit size={16} className="mr-2" />
          Edit
        </Button>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="text-lg font-semibold">
                {recurringTransaction.description || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-lg font-semibold">
                {formatCurrency(Number(recurringTransaction.amount))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Frequency</div>
              <Badge className={getFrequencyColor(recurringTransaction.frequency)}>
                {recurringTransaction.frequency}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={getStatusColor(recurringTransaction.status)}>
                {recurringTransaction.status}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div className="text-base">
                {formatDate(recurringTransaction.startDate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">End Date</div>
              <div className="text-base">
                {recurringTransaction.endDate
                  ? formatDate(recurringTransaction.endDate)
                  : "No end date"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bank Account</div>
              <div className="text-base">
                {recurringTransaction.bankAccount?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Category</div>
              <div className="text-base">
                {recurringTransaction.category?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active</div>
              <Badge variant={recurringTransaction.isActive ? "default" : "secondary"}>
                {recurringTransaction.isActive ? "Yes" : "No"}
              </Badge>
            </div>
            {recurringTransaction.lastProcessed && (
              <div>
                <div className="text-sm text-muted-foreground">Last Processed</div>
                <div className="text-base">
                  {formatDate(recurringTransaction.lastProcessed)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {recurringTransaction.transactions &&
        recurringTransaction.transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringTransaction.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

