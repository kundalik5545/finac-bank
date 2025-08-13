import { Card, CardContent } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { CreditCard, Banknote } from "lucide-react";
import Link from "next/link";

export default function BankCard({ bankCard }) {
  return (
    <div className="flex flex-wrap gap-5 justify-around transition-all duration-300 ease-in-out space-y-5">
      {bankCard?.map((account, i) => (
        <Link href={`/bank-account/details/${account.id}`} key={i}>
          <Card className="w-96 md:w-[430px] lg:w-[450px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform duration-300 hover:scale-105">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              {/* Top: Bank Name + Icon */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {account.bankName}
                </div>
                <Wifi className="w-6 h-6 text-gray-500 dark:text-gray-300" />
              </div>

              {/* Card Number */}
              <div className="mt-6 text-xl tracking-widest font-mono text-gray-800 dark:text-gray-100">
                **** **** ****{" "}
                <span className="font-bold">{account.cardNumber}</span>
              </div>

              {/* Validity */}
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Valid {account.validTill}
              </div>

              {/* Cardholder Name & VISA */}
              <div className="mt-8 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {account.holderName}
                </span>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-lg font-bold tracking-wide">
                    {account.visa}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
