"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { addBankAccount } from "@/action/bank-account";
import { useRouter } from "next/navigation";

export default function AddBankAccountPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-5xl flex justify-center items-center min-h-screen p-3">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add Bank Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addBankAccount} className="space-y-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input name="bankName" placeholder="Enter bank name" required />
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input name="userId" placeholder="Enter user ID" required />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input name="accountNumber" placeholder="Optional" />
            </div>

            {/* IFSC Code */}
            <div className="space-y-2">
              <Label htmlFor="iFSC_Code">IFSC Code</Label>
              <Input name="iFSC_Code" placeholder="Optional" />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input name="branch" placeholder="Optional" />
            </div>

            {/* Opening Balance */}
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input
                type="number"
                step="0.01"
                name="openingBalance"
                placeholder="0.00"
              />
            </div>

            {/* Account Type, Status, Currency */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Account Type */}
              <div className="flex-1 space-y-2">
                <Label>Account Type</Label>
                <Select name="accountType" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVING">Savings</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SALARY">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex-1 space-y-2">
                <Label>Status</Label>
                <Select name="statuses" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="flex-1 space-y-2">
                <Label>Currency</Label>
                <Select name="currency" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Primary */}
            <div className="flex items-center space-x-2">
              <input type="checkbox" name="isPrimary" id="isPrimary" />
              <Label htmlFor="isPrimary">Set as Primary Account</Label>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea name="comments" placeholder="Optional" />
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-3 justify-end">
              <Button
                type="reset"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  router.back(); // Go back instead of just clearing
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Bank Account</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
