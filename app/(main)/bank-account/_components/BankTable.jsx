"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash, Edit, Star, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function BankTable({ bankCard, activeAccountId, totalBalance }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});

  const handleSetPrimary = async (accountId, isCurrentlyPrimary) => {
    if (isCurrentlyPrimary) return; // Already primary

    setLoadingStates((prev) => ({ ...prev, [accountId]: true }));

    try {
      const response = await fetch(`/api/bank-accounts/${accountId}/primary`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Primary account updated successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to set primary account");
      }
    } catch (error) {
      toast.error("Failed to set primary account");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const handleSetActive = async (accountId) => {
    setLoadingStates((prev) => ({ ...prev, [`active-${accountId}`]: true }));

    try {
      const response = await fetch(`/api/bank-accounts/${accountId}/active`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Active account updated successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to set active account");
      }
    } catch (error) {
      toast.error("Failed to set active account");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`active-${accountId}`]: false }));
    }
  };

  const handleDelete = async (accountId, accountName) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${accountId}`]: true }));

    try {
      const response = await fetch(`/api/bank-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Bank account deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete bank account");
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${accountId}`]: false }));
    }
  };

  const handleEdit = (accountId) => {
    router.push(`/bank-account/edit/${accountId}`);
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[800px]"}>
        <TableCaption>A list of all your bank accounts.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-sm">Primary</TableHead>
            <TableHead className="text-sm">Bank Name</TableHead>
            <TableHead className="hidden md:table-cell text-sm">Type</TableHead>
            <TableHead className="text-right hidden md:table-cell text-sm">
              Account Number
            </TableHead>
            <TableHead className="text-right hidden md:table-cell text-sm">
              Status
            </TableHead>
            <TableHead className="text-right text-sm">Balance</TableHead>
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bankCard?.map((account) => {
            const isActive = activeAccountId === account.id;
            const isPrimary = account.isPrimary;
            const accountNumber = account.bankAccount || "";
            const lastFour =
              accountNumber.length >= 4 ? accountNumber.slice(-4) : "----";

            return (
              <TableRow
                key={account.id}
                className={isActive ? "bg-green-50 dark:bg-green-950/20" : ""}
              >
                <TableCell className="text-sm">
                  <Checkbox
                    checked={isPrimary}
                    onCheckedChange={() =>
                      handleSetPrimary(account.id, isPrimary)
                    }
                    disabled={loadingStates[account.id]}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{account.name}</span>
                    {isPrimary && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {account.type}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell text-sm">
                  {accountNumber ? `**** ${lastFour}` : "—"}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell text-sm">
                  <div className="flex items-center justify-end gap-2">
                    {isActive && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                    {account.isActive ? (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Enabled
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(Number(account.balance))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {!isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetActive(account.id)}
                        disabled={loadingStates[`active-${account.id}`]}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id, account.name)}
                      disabled={loadingStates[`delete-${account.id}`]}
                    >
                      <Trash size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={isMobile ? 2 : 5}
              className="font-semibold text-sm"
            >
              Total (Active Accounts)
            </TableCell>
            <TableCell className="text-right font-semibold text-sm">
              {formatCurrency(totalBalance || 0)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
