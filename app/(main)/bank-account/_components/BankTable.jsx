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
import { Trash, Edit } from "lucide-react";

export function BankTable({ bankCard }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const isMobile = useIsMobile();

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[600px]"}>
        <TableCaption>A list of all your bank accounts.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-sm">ID</TableHead>
            <TableHead className="text-sm">Bank</TableHead>
            <TableHead className="hidden md:table-cell text-sm">
              User Name
            </TableHead>
            <TableHead className="text-right hidden md:table-cell text-sm">
              Account Number
            </TableHead>
            <TableHead className="text-right hidden md:table-cell text-sm">
              Card Validity
            </TableHead>
            <TableHead className="text-right text-sm">Balance</TableHead>
            <TableHead className="text-right text-sm">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bankCard?.map((account, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium text-sm">
                {account.id}
              </TableCell>
              <TableCell className="text-sm">
                {isMobile ? account.bankShortName : account.bankName}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {account.holderName}
              </TableCell>
              <TableCell className="text-right hidden md:table-cell text-sm">
                **** {account.cardNumber.slice(-4)}
              </TableCell>
              <TableCell className="text-right hidden md:table-cell text-sm">
                {account.validTill}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatCurrency(account.currentBalance)}
              </TableCell>
              <TableCell className="flex items-center justify-end gap-2">
                <Edit size={16} className="cursor-pointer" />
                <Trash size={16} className="cursor-pointer text-red-500" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={isMobile ? 2 : 5}
              className="font-semibold text-sm"
            >
              Total
            </TableCell>
            <TableCell className="text-right font-semibold text-sm">
              {formatCurrency(
                bankCard?.reduce(
                  (sum, acc) => sum + (acc.currentBalance || 0),
                  0
                )
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
