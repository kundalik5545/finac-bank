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
import { Edit, Trash, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function RecurringTransactionsTable({
  recurringTransactions,
  total,
  page,
  limit,
  onPageChange,
  onRefresh,
}) {
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

  const handleDelete = async (recurringTransactionId, description) => {
    if (
      !confirm(
        `Are you sure you want to delete "${description || "this recurring transaction"}"?`
      )
    ) {
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      [`delete-${recurringTransactionId}`]: true,
    }));

    try {
      const response = await fetch(
        `/api/recurring-transactions/${recurringTransactionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Recurring transaction deleted successfully");
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete recurring transaction");
      }
    } catch (error) {
      toast.error("Failed to delete recurring transaction");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${recurringTransactionId}`]: false,
      }));
    }
  };

  const handleView = (recurringTransactionId) => {
    router.push(`/recurring-transactions/details/${recurringTransactionId}`);
  };

  const handleEdit = (recurringTransactionId) => {
    router.push(`/recurring-transactions/edit/${recurringTransactionId}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (!recurringTransactions || recurringTransactions.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">No recurring transactions found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[1000px]"}>
        <TableCaption>
          Showing {recurringTransactions.length} of {total} recurring transactions
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">Description</TableHead>
            {!isMobile && <TableHead className="text-sm">Start Date</TableHead>}
            {!isMobile && <TableHead className="text-sm">End Date</TableHead>}
            <TableHead className="text-sm">Frequency</TableHead>
            <TableHead className="text-right text-sm">Amount</TableHead>
            {!isMobile && <TableHead className="text-sm">Bank Account</TableHead>}
            {!isMobile && <TableHead className="text-sm">Category</TableHead>}
            <TableHead className="text-sm">Status</TableHead>
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {recurringTransactions.map((rt) => {
            const amount = Number(rt.amount);

            return (
              <TableRow
                key={rt.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(rt.id)}
              >
                <TableCell className="text-sm">
                  <div>
                    <div className="font-medium">{rt.description || "—"}</div>
                    {isMobile && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(rt.startDate)}
                        {rt.endDate && ` - ${formatDate(rt.endDate)}`}
                      </div>
                    )}
                    {isMobile && rt.bankAccount && (
                      <div className="text-xs text-muted-foreground">
                        {rt.bankAccount.name}
                      </div>
                    )}
                    {isMobile && rt.category && (
                      <div className="text-xs text-muted-foreground">
                        {rt.category.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">{formatDate(rt.startDate)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    {rt.endDate ? formatDate(rt.endDate) : "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  <Badge className={getFrequencyColor(rt.frequency)}>
                    {rt.frequency}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {formatCurrency(amount)}
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    {rt.bankAccount?.name || "—"}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    {rt.category?.name || "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  <Badge className={getStatusColor(rt.status)}>{rt.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(rt.id)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rt.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rt.id, rt.description)}
                      disabled={loadingStates[`delete-${rt.id}`]}
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

