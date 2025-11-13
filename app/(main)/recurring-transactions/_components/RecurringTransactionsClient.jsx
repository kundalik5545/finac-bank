"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Table2, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RecurringTransactionsTable } from "./RecurringTransactionsTable";
import { RecurringTransactionsCalendar } from "./RecurringTransactionsCalendar";
import { RecurringTransactionsStats } from "./RecurringTransactionsStats";

export default function RecurringTransactionsClient({
  initialBankAccounts,
  initialCategories,
}) {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"

  const fetchRecurringTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/recurring-transactions?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setRecurringTransactions(data.recurringTransactions || []);
        setStats(data.stats || null);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fetch recurring transactions");
      }
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
      toast.error("Failed to fetch recurring transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchRecurringTransactions();
  };

  return (
    <div className="recurring-transactions-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-5">
      {/* Header */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Recurring Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your recurring transactions and view them in table or calendar format.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "calendar" : "table")}>
            {viewMode === "table" ? (
              <>
                <CalendarIcon size={16} className="mr-2" />
                Calendar View
              </>
            ) : (
              <>
                <Table2 size={16} className="mr-2" />
                Table View
              </>
            )}
          </Button>
          <Button>
            <Link href="/recurring-transactions/add" className="flex items-center gap-2">
              <Plus size={16} /> Add Recurring Transaction
            </Link>
          </Button>
        </div>
      </section>

      {/* Statistics */}
      {stats && <RecurringTransactionsStats stats={stats} />}

      {/* Content based on view mode */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : viewMode === "table" ? (
        <RecurringTransactionsTable
          recurringTransactions={recurringTransactions}
          total={total}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
        />
      ) : (
        <RecurringTransactionsCalendar
          recurringTransactions={recurringTransactions}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

