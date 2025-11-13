"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

export default function TransactionDetailsClient({ transaction }) {
  const router = useRouter();
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "INCOME":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "EXPENSE":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "TRANSFER":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "INVESTMENT":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this transaction?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Transaction deleted successfully");
        router.push("/transactions");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/transactions/edit/${transaction.id}`);
  };

  const amount = Number(transaction.amount);
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="transaction-details container mx-auto max-w-4xl px-2 md:px-0 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Transaction Details</CardTitle>
            <div className="flex gap-2">
              <Badge className={getTypeColor(transaction.type)}>
                {transaction.type}
              </Badge>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div>
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className={`text-3xl font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
              {isIncome ? "+" : "-"}
              {formatCurrency(amount)}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="text-lg font-medium">{formatDate(transaction.date)}</div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="text-lg">{transaction.description}</div>
            </div>
          )}

          {/* Bank Account */}
          <div>
            <div className="text-sm text-muted-foreground">Bank Account</div>
            <div className="text-lg font-medium">
              {transaction.bankAccount?.name || "—"}
            </div>
          </div>

          {/* Category */}
          {(transaction.category || transaction.subCategory) && (
            <div>
              <div className="text-sm text-muted-foreground">Category</div>
              <div className="text-lg">
                {transaction.category?.name || "—"}
                {transaction.subCategory && ` • ${transaction.subCategory.name}`}
              </div>
            </div>
          )}

          {/* Payment Method */}
          {transaction.paymentMethod && (
            <div>
              <div className="text-sm text-muted-foreground">Payment Method</div>
              <div className="text-lg">
                <Badge variant="outline">{transaction.paymentMethod}</Badge>
              </div>
            </div>
          )}

          {/* Comments */}
          {transaction.comments && (
            <div>
              <div className="text-sm text-muted-foreground">Comments</div>
              <div className="text-lg">{transaction.comments}</div>
            </div>
          )}

          {/* Currency */}
          <div>
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="text-lg">{transaction.currency}</div>
          </div>

          {/* Status */}
          <div>
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-lg">
              {transaction.isActive ? (
                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

