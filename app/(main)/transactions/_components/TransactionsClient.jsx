"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterPanel from "./FilterPanel";
import { TransactionTable } from "./TransactionTable";
import { TransactionStats } from "./TransactionStats";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function TransactionsClient({ initialBankAccounts, initialCategories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
      
      // Add pagination if not present
      if (!params.has("page")) {
        params.set("page", page.toString());
      }
      if (!params.has("limit")) {
        params.set("limit", limit.toString());
      }

      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || null);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/transactions?${params.toString()}`);
  };

  const handleFilterChange = () => {
    // Reset to page 1 when filters change
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <div className="transactions-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-5">
      {/* Header */}
      <section className="flex justify-between items-center pb-5">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <ExportButton />
          <Button>
            <Link href="/transactions/add" className="flex items-center gap-2">
              <Plus size={16} /> Add Transaction
            </Link>
          </Button>
        </div>
      </section>

      {/* Filter Panel */}
      <FilterPanel
        bankAccounts={initialBankAccounts}
        categories={initialCategories}
        onFilterChange={handleFilterChange}
      />

      {/* Statistics */}
      {stats && <TransactionStats stats={stats} />}

      {/* Transaction Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          total={total}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onRefresh={fetchTransactions}
        />
      )}
    </div>
  );
}

