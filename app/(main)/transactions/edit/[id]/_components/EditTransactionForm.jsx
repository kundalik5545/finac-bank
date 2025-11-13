"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateTransactionSchema } from "@/lib/formSchema";

export default function EditTransactionForm({ transaction, bankAccounts, categories }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategories, setSubCategories] = useState([]);

  const form = useForm({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      amount: Number(transaction.amount),
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      date: new Date(transaction.date).toISOString().split("T")[0],
      description: transaction.description || "",
      comments: transaction.comments || "",
      isActive: transaction.isActive,
      bankAccountId: transaction.bankAccountId,
      categoryId: transaction.categoryId || "",
      subCategoryId: transaction.subCategoryId || "",
      paymentMethod: transaction.paymentMethod || "",
    },
  });

  // Fetch sub-categories when category changes
  const selectedCategoryId = form.watch("categoryId");
  useEffect(() => {
    if (selectedCategoryId) {
      fetch(`/api/categories/${selectedCategoryId}/subcategories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.subCategories) {
            setSubCategories(data.subCategories);
          }
        })
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
      form.setValue("subCategoryId", "");
    }
  }, [selectedCategoryId, form]);

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      // Convert empty strings to null for optional fields
      const submitData = {
        ...values,
        categoryId: values.categoryId || null,
        subCategoryId: values.subCategoryId || null,
        paymentMethod: values.paymentMethod || null,
      };

      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Transaction updated successfully");
        router.push(`/transactions/details/${transaction.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="edit-transaction container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center justify-between">
              <span>Edit Transaction</span>
              <X
                size="24"
                className="cursor-pointer"
                onClick={() => router.back()}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type, Currency, Status */}
              <div className="flex flex-col md:flex-row gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INCOME">Income</SelectItem>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="TRANSFER">Transfer</SelectItem>
                          <SelectItem value="INVESTMENT">Investment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date and Bank Account */}
              <div className="flex flex-col md:flex-row gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Bank Account *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category and Sub-Category */}
              <div className="flex flex-col md:flex-row gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategoryId && subCategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subCategoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Sub-Category</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-category (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {subCategories.map((subCat) => (
                              <SelectItem key={subCat.id} value={subCat.id}>
                                {subCat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Transaction description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comments */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="form-btn flex gap-3 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Transaction"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

