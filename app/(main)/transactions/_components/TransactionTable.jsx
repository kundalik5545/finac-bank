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
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Trash, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function TransactionTable({ transactions, total, page, limit, onPageChange, onRefresh }) {
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
    switch (type) {
      case "INCOME":
        return "text-green-600 dark:text-green-400";
      case "EXPENSE":
        return "text-red-600 dark:text-red-400";
      case "TRANSFER":
        return "text-blue-600 dark:text-blue-400";
      case "INVESTMENT":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "";
    }
  };

  const getTypeBgColor = (type) => {
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

  const handleDelete = async (transactionId, description) => {
    if (!confirm(`Are you sure you want to delete "${description || "this transaction"}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${transactionId}`]: true }));

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Transaction deleted successfully");
        router.refresh(); // Refresh server components
        if (onRefresh) {
          onRefresh(); // Refresh client data
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${transactionId}`]: false }));
    }
  };

  const handleView = (transactionId) => {
    router.push(`/transactions/details/${transactionId}`);
  };

  const handleEdit = (transactionId) => {
    router.push(`/transactions/edit/${transactionId}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[1000px]"}>
        <TableCaption>
          Showing {transactions.length} of {total} transactions
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">Date</TableHead>
            <TableHead className="text-sm">Description</TableHead>
            {!isMobile && <TableHead className="text-sm">Category</TableHead>}
            {!isMobile && <TableHead className="text-sm">Bank Account</TableHead>}
            <TableHead className="text-sm">Type</TableHead>
            <TableHead className="text-right text-sm">Amount</TableHead>
            {!isMobile && <TableHead className="text-sm">Status</TableHead>}
            {!isMobile && <TableHead className="text-sm">Payment</TableHead>}
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((transaction) => {
            const amount = Number(transaction.amount);
            const isIncome = transaction.type === "INCOME";
            const amountDisplay = isIncome ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`;

            return (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(transaction.id)}
              >
                <TableCell className="text-sm">{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-sm">
                  <div>
                    <div className="font-medium">{transaction.description || "—"}</div>
                    {isMobile && transaction.category && (
                      <div className="text-xs text-muted-foreground">
                        {transaction.category.name}
                        {transaction.subCategory && ` • ${transaction.subCategory.name}`}
                      </div>
                    )}
                    {isMobile && transaction.bankAccount && (
                      <div className="text-xs text-muted-foreground">
                        {transaction.bankAccount.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    <div>
                      {transaction.category?.name || "—"}
                      {transaction.subCategory && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.subCategory.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    {transaction.bankAccount?.name || "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  <Badge className={getTypeBgColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right text-sm font-semibold ${getTypeColor(transaction.type)}`}>
                  {isIncome ? (
                    <ArrowUp className="inline w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="inline w-4 h-4 mr-1" />
                  )}
                  {amountDisplay}
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    {transaction.paymentMethod ? (
                      <Badge variant="outline">{transaction.paymentMethod}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(transaction.id)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id, transaction.description)}
                      disabled={loadingStates[`delete-${transaction.id}`]}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

