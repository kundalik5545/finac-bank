// components/BankCard.jsx
import React from "react";
import Link from "next/link";
import { Wifi, CreditCard } from "lucide-react";

const gradients = [
"bg-gradient-to-tr from-indigo-700 via-purple-700 to-purple-500 dark:from-indigo-900 dark:via-purple-900 dark:to-purple-700",
"bg-gradient-to-tr from-orange-400 via-pink-500 to-pink-700 dark:from-orange-600 dark:via-pink-700 dark:to-pink-900",
"bg-gradient-to-tr from-cyan-600 via-blue-400 to-sky-500 dark:from-cyan-800 dark:via-blue-700 dark:to-sky-700",
"bg-gradient-to-tr from-yellow-400 via-red-400 to-rose-400 dark:from-yellow-600 dark:via-red-600 dark:to-rose-700",
];

function formatCurrency(value) {
if (value == null) return "—";
return new Intl.NumberFormat("en-IN", {
style: "currency",
currency: "INR",
minimumFractionDigits: 2,
}).format(value);
}

export default function BankCard({ bankCard }) {
if (!bankCard || bankCard.length === 0) {
return (
<div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
No accounts to display
</div>
);
}

return (
<div className="flex flex-wrap justify-center gap-8 py-5">
{bankCard.map((account, i) => {
const grad = gradients[i % gradients.length];
return (
<Link
key={account.id}
href={`/bank-account/details/${account.id}`}
aria-label={`Open details for ${account.bankName ?? "bank account"}`}
className={`relative w-[340px] h-[210px] rounded-xl shadow-2xl overflow-hidden group 
                        transition-transform duration-300 transform hover:scale-105 focus:scale-105 
                        border border-transparent focus:ring-4 focus:ring-offset-2 
                        focus:ring-indigo-400 dark:focus:ring-indigo-700 ${grad}`} >
{/_ subtle border overlay _/}
<div className="absolute inset-0 rounded-xl pointer-events-none border border-white/10 dark:border-black/20" />

            {/* Top row: bank name and wifi/chip icon */}
            <div className="flex justify-between items-center px-6 pt-5 z-10 relative">
              <span className="text-white/95 text-lg sm:text-xl font-semibold drop-shadow-sm">
                {account.bankName ?? "Your Bank"}
              </span>
              <Wifi className="w-6 h-6 text-white/80" />
            </div>

            {/* Mastercard mark */}
            <div className="absolute right-6 top-12 flex flex-col items-center z-20">
              <div className="flex items-center gap-1">
                <span className="block w-7 h-7 rounded-full bg-red-500 opacity-95" />
                <span className="block w-7 h-7 -ml-2 rounded-full bg-yellow-400 opacity-95" />
              </div>
              <span className="uppercase text-[10px] font-semibold text-white/85 tracking-widest mt-1">
                mastercard
              </span>
            </div>

            {/* CARD NUMBER */}
            <div className="px-6 pt-16 font-mono text-2xl tracking-wider text-white drop-shadow-sm z-10 relative">
              <span className="opacity-75 mr-2">****</span>
              <span className="opacity-75 mr-2">****</span>
              <span className="opacity-75 mr-2">****</span>
              <span className="font-bold">
                {account.cardNumber ? account.cardNumber.slice(-4) : "0000"}
              </span>
            </div>

            {/* Details bar */}
            <div className="absolute bottom-0 left-0 w-full bg-black/28 dark:bg-black/40 backdrop-blur-sm px-6 py-3 flex flex-col gap-1 z-10">
              <div className="flex justify-between text-xs text-white/85">
                <div>
                  <span className="block font-semibold tracking-wide">VALID THRU</span>
                  <span className="block font-mono text-sm">
                    {account.validTill ?? "--/--"}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold tracking-wide">BALANCE</span>
                  <span className="block font-mono text-sm">
                    {formatCurrency(account.currentBalance)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-2">
                <span className="text-white/95 text-base font-medium tracking-wide">
                  {account.holderName ?? "Cardholder"}
                </span>
                <span className="flex items-center gap-2 text-white/95 text-sm font-semibold">
                  <CreditCard className="w-4 h-4" />
                  <span className="uppercase">{account.visa ?? "CARD"}</span>
                </span>
              </div>
            </div>

            {/* Chip and glow effects */}
            <div className="absolute left-6 top-12 w-10 h-8 rounded-sm bg-yellow-300/30 border border-white/10 z-10 transform rotate-2" />

            {/* subtle reflective gradient */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl z-0 opacity-30 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.06) 100%)",
              }}
            />

            {/* bottom sheen */}
            <div
              className="pointer-events-none absolute -bottom-10 -left-16 w-56 h-56 rounded-full blur-3xl opacity-20 dark:opacity-30"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 40%)",
              }}
            />
          </Link>
        );
      })}
    </div>

);
}
