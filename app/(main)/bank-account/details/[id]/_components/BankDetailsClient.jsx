"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  DollarSign,
  Trash,
  Edit,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function BankDetailsClient({ account, activeAccountId }) {
  const router = useRouter();
  const [filter, setFilter] = useState("daily");
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = activeAccountId === account.id;
  const isPrimary = account.isPrimary;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bank-accounts/${account.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Bank account deleted successfully");
        router.push("/bank-account");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete bank account");
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/bank-account/edit/${account.id}`);
  };

  const formatCurrency = (value, currency = "INR") => {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const metrics = [
    {
      title: "Balance",
      value: formatCurrency(Number(account.balance), account.currency),
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Account Type",
      value: account.type,
      icon: Banknote,
      color: "text-blue-500",
    },
    {
      title: "Status",
      value: account.isActive ? "Active" : "Inactive",
      icon: ArrowUpCircle,
      color: account.isActive ? "text-green-500" : "text-red-500",
    },
    {
      title: "Currency",
      value: account.currency,
      icon: ArrowDownCircle,
      color: "text-yellow-500",
    },
  ];

  // Mock chart data - can be replaced with real transaction data later
  const chartData = {
    daily: [
      { name: "Mon", amount: 3000 },
      { name: "Tue", amount: 5000 },
      { name: "Wed", amount: 2000 },
      { name: "Thu", amount: 7000 },
      { name: "Fri", amount: 4000 },
      { name: "Sat", amount: 6000 },
      { name: "Sun", amount: 3500 },
    ],
    weekly: [
      { name: "Week 1", amount: 15000 },
      { name: "Week 2", amount: 22000 },
      { name: "Week 3", amount: 18000 },
      { name: "Week 4", amount: 25000 },
    ],
    monthly: [
      { name: "Jan", amount: 80000 },
      { name: "Feb", amount: 75000 },
      { name: "Mar", amount: 90000 },
      { name: "Apr", amount: 85000 },
    ],
  };

  // Mock transactions - can be replaced with real transaction data later
  const transactions = [];

  return (
    <div className="bank-account-details container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-5">
      {/* Bank Details */}
      <section className="flex flex-wrap justify-between items-center pb-5 shadow-md rounded-lg p-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold pb-2">
            Bank Details
          </h1>
          <div className="flex items-center gap-2">
            {isPrimary && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500" />
                Primary
              </span>
            )}
            {isActive && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
        </div>
        <section className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <p>
              <strong>Bank Name:</strong> {account.name}
            </p>
            {account.bankAccount && (
              <p>
                <strong>Account Number:</strong> ****
                {account.bankAccount.slice(-4)}
              </p>
            )}
            {account.ifscCode && (
              <p>
                <strong>IFSC Code:</strong> {account.ifscCode}
              </p>
            )}
            {account.branch && (
              <p>
                <strong>Branch:</strong> {account.branch}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash size={16} className="mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </section>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <Card key={idx} className="flex items-center gap-4">
            <CardHeader>
              <m.icon className={`h-8 w-8 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-sm">{m.title}</CardTitle>
              <p className="text-xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Chart Section */}
      <section className="shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transactions Overview</h2>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <section className="flex flex-col lg:flex-row gap-6">
          {/* Bar Chart */}
          <div className="w-full lg:w-2/3 h-[500px] shadow-xl rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData[filter]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="w-full lg:w-1/3 h-[500px] shadow-xl rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={chartData[filter]}
                  dataKey="amount"
                  nameKey="name"
                  outerRadius={150}
                  fill="#4F46E5"
                  label
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      {/* Transactions Table */}
      <section className="pt-5 shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Bank Transactions</h2>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, idx) => (
                <TableRow key={idx}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell
                    className={
                      t.amount < 0 ? "text-red-500" : "text-green-500"
                    }
                  >
                    ₹{Math.abs(t.amount)}
                  </TableCell>
                  <TableCell>{t.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No transactions found
          </p>
        )}
      </section>
    </div>
  );
}

