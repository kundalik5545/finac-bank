"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterPanel({ bankAccounts, categories, onFilterChange }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(true);
  // Helper to get param value or undefined (not empty string)
  const getParam = (key) => {
    const value = searchParams.get(key);
    return value && value !== "" ? value : "";
  };

  const [filters, setFilters] = useState({
    dateFrom: getParam("dateFrom"),
    dateTo: getParam("dateTo"),
    bankAccountId: getParam("bankAccountId"),
    categoryId: getParam("categoryId"),
    subCategoryId: getParam("subCategoryId"),
    type: getParam("type"),
    status: getParam("status"),
    paymentMethod: getParam("paymentMethod"),
    amountMin: getParam("amountMin"),
    amountMax: getParam("amountMax"),
    search: getParam("search"),
    sortBy: getParam("sortBy") || "date",
    sortOrder: getParam("sortOrder") || "desc",
    isActive: searchParams.get("isActive") !== "false",
  });

  const [subCategories, setSubCategories] = useState([]);
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (filters.categoryId) {
      fetch(`/api/categories/${filters.categoryId}/subcategories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.subCategories) {
            setSubCategories(data.subCategories);
          }
        })
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
      setFilters((prev) => ({ ...prev, subCategoryId: "" }));
    }
  }, [filters.categoryId]);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "" && value !== "date" && value !== "desc" && value !== true
  ).length;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value) => {
    updateFilter("search", value);
    
    // Debounce search
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      applyFilters({ ...filters, search: value });
    }, 500);
    
    setSearchDebounce(timeout);
  };

  const applyFilters = (filterValues = filters) => {
    const params = new URLSearchParams();
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "" && key !== "isActive") {
        params.set(key, value);
      }
      if (key === "isActive" && !value) {
        params.set(key, "false");
      }
    });

    router.push(`/transactions?${params.toString()}`);
    if (onFilterChange) {
      onFilterChange(filterValues);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      dateFrom: "",
      dateTo: "",
      bankAccountId: "",
      categoryId: "",
      subCategoryId: "",
      type: "",
      status: "",
      paymentMethod: "",
      amountMin: "",
      amountMax: "",
      search: "",
      sortBy: "date",
      sortOrder: "desc",
      isActive: true,
    };
    setFilters(defaultFilters);
    router.push("/transactions");
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const quickFilterPresets = {
    today: () => {
      const today = new Date().toISOString().split("T")[0];
      updateFilter("dateFrom", today);
      updateFilter("dateTo", today);
      applyFilters({ ...filters, dateFrom: today, dateTo: today });
    },
    thisWeek: () => {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      updateFilter("dateFrom", weekStart.toISOString().split("T")[0]);
      updateFilter("dateTo", weekEnd.toISOString().split("T")[0]);
      applyFilters({
        ...filters,
        dateFrom: weekStart.toISOString().split("T")[0],
        dateTo: weekEnd.toISOString().split("T")[0],
      });
    },
    thisMonth: () => {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      updateFilter("dateFrom", monthStart.toISOString().split("T")[0]);
      updateFilter("dateTo", monthEnd.toISOString().split("T")[0]);
      applyFilters({
        ...filters,
        dateFrom: monthStart.toISOString().split("T")[0],
        dateTo: monthEnd.toISOString().split("T")[0],
      });
    },
    thisYear: () => {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      updateFilter("dateFrom", yearStart.toISOString().split("T")[0]);
      updateFilter("dateTo", yearEnd.toISOString().split("T")[0]);
      applyFilters({
        ...filters,
        dateFrom: yearStart.toISOString().split("T")[0],
        dateTo: yearEnd.toISOString().split("T")[0],
      });
    },
    allTime: () => {
      updateFilter("dateFrom", "");
      updateFilter("dateTo", "");
      applyFilters({ ...filters, dateFrom: "", dateTo: "" });
    },
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Quick Filter Presets */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={quickFilterPresets.today}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={quickFilterPresets.thisWeek}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={quickFilterPresets.thisMonth}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={quickFilterPresets.thisYear}
            >
              This Year
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={quickFilterPresets.allTime}
            >
              All Time
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={filters.bankAccountId || "all"}
                onValueChange={(value) => updateFilter("bankAccountId", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {bankAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={(value) => updateFilter("categoryId", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-Category */}
            {filters.categoryId && (
              <div className="space-y-2">
                <Label>Sub-Category</Label>
                <Select
                  value={filters.subCategoryId || "all"}
                  onValueChange={(value) => updateFilter("subCategoryId", value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sub-Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub-Categories</SelectItem>
                    {subCategories?.map((subCat) => (
                      <SelectItem key={subCat.id} value={subCat.id}>
                        {subCat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => updateFilter("type", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="INVESTMENT">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={filters.paymentMethod || "all"}
                onValueChange={(value) => updateFilter("paymentMethod", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.amountMin}
                onChange={(e) => updateFilter("amountMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.amountMax}
                onChange={(e) => updateFilter("amountMax", e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                type="text"
                placeholder="Search description or comments..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Only Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={filters.isActive}
              onCheckedChange={(checked) => updateFilter("isActive", checked)}
            />
            <Label htmlFor="isActive">Show only active transactions</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={() => applyFilters()}>Apply Filters</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

