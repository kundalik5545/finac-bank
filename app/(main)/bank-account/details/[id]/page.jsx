"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  DollarSign,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Pie, PieChart } from "recharts";
import { Plus } from "lucide-react";
import { Trash } from "lucide-react";

export default function BankDetailsPage() {
  const [filter, setFilter] = useState("daily");

  const metrics = [
    {
      title: "Total Balance",
      value: "₹2,50,000",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Total Credits",
      value: "₹1,20,000",
      icon: ArrowUpCircle,
      color: "text-blue-500",
    },
    {
      title: "Total Debits",
      value: "₹80,000",
      icon: ArrowDownCircle,
      color: "text-red-500",
    },
    {
      title: "Active Accounts",
      value: "3",
      icon: Banknote,
      color: "text-yellow-500",
    },
  ];

  const transactions = [
    {
      date: "2025-08-01",
      description: "Salary Credit",
      amount: 50000,
      type: "Credit",
    },
    {
      date: "2025-08-02",
      description: "Grocery Store",
      amount: -2500,
      type: "Debit",
    },
    {
      date: "2025-08-03",
      description: "Electricity Bill",
      amount: -1500,
      type: "Debit",
    },
    {
      date: "2025-08-04",
      description: "Freelance Payment",
      amount: 12000,
      type: "Credit",
    },
  ];

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

  return (
    <div className="bank-account-details container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 space-y-5">
      {/* Bank Details */}
      <section className="flex flex-wrap justify-between items-center pb-5 shadow-md rounded-lg p-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold pb-5">
          Bank Details
        </h1>
        <section className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
          <p>
            <strong>Bank Name:</strong> HDFC Bank
          </p>
          <p>
            <strong>Account Number:</strong> 1234567890
          </p>
          <p>
            <strong>IFSC Code:</strong> HDFC0001234
          </p>
          <Button className="" variant={`destructive`}>
            <Trash size="icon" /> Delete
          </Button>
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
      <section className=" shadow-md rounded-lg p-4 ">
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
            <div className="w-full lg:w-2/3 h-[500px] shadow-xl rounded-2xl p-4 ">
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
      </section>

      {/* Transactions Table */}
      <section className="pt-5 shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Bank Transactions</h2>
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
                  className={t.amount < 0 ? "text-red-500" : "text-green-500"}
                >
                  ₹{Math.abs(t.amount)}
                </TableCell>
                <TableCell>{t.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
