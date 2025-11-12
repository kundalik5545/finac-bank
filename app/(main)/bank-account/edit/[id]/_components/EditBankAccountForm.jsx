"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBankSchema } from "@/lib/formSchema";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function EditBankAccountForm({ account }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(updateBankSchema),
  });

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        type: account.type,
        currency: account.currency,
        isActive: account.isActive,
        balance: Number(account.balance),
        ifscCode: account.ifscCode || "",
        branch: account.branch || "",
        bankId: account.bankId || "",
        bankAccount: account.bankAccount || "",
        isPrimary: account.isPrimary,
      });
    }
  }, [account, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bank-accounts/${account.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Bank account updated successfully");
        router.push("/bank-account");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update bank account");
      }
    } catch (error) {
      toast.error("Failed to update bank account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Bank Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Bank Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter bank name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Account Number</Label>
              <Input
                id="bankAccount"
                {...register("bankAccount")}
                placeholder="Optional"
              />
              {errors.bankAccount && (
                <p className="text-sm text-red-500">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>

            {/* IFSC Code */}
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                {...register("ifscCode")}
                placeholder="Optional"
              />
              {errors.ifscCode && (
                <p className="text-sm text-red-500">
                  {errors.ifscCode.message}
                </p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                {...register("branch")}
                placeholder="Optional"
              />
              {errors.branch && (
                <p className="text-sm text-red-500">{errors.branch.message}</p>
              )}
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                {...register("balance", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.balance && (
                <p className="text-sm text-red-500">
                  {errors.balance.message}
                </p>
              )}
            </div>

            {/* Account Type, Currency */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Account Type */}
              <div className="flex-1 space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Currency */}
              <div className="flex-1 space-y-2">
                <Label>Currency</Label>
                <Select
                  value={watch("currency")}
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-500">
                    {errors.currency.message}
                  </p>
                )}
              </div>
            </div>

            {/* Active and Primary */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Account is Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={watch("isPrimary")}
                  onCheckedChange={(checked) => setValue("isPrimary", checked)}
                />
                <Label htmlFor="isPrimary">Set as Primary Account</Label>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Bank Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

