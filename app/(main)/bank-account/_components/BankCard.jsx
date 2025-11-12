// components/BankCard.jsx
import React from "react";
import Link from "next/link";
import { Wifi, CreditCard, Star, CheckCircle2 } from "lucide-react";

const gradients = [
  "bg-gradient-to-tr from-indigo-700 via-purple-700 to-purple-500 dark:from-indigo-900 dark:via-purple-900 dark:to-purple-700",
  "bg-gradient-to-tr from-orange-400 via-pink-500 to-pink-700 dark:from-orange-600 dark:via-pink-700 dark:to-pink-900",
  "bg-gradient-to-tr from-cyan-600 via-blue-400 to-sky-500 dark:from-cyan-800 dark:via-blue-700 dark:to-sky-700",
  "bg-gradient-to-tr from-yellow-400 via-red-400 to-rose-400 dark:from-yellow-600 dark:via-red-600 dark:to-rose-700",
];

function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return String(value);
  }
}

// Return array of four blocks: ['****','****','****','1234']
function formatCardBlocks(cardNumber = "") {
  const digits = (cardNumber || "").replace(/\D/g, "").slice(-16); // last 16 digits max
  const last4 = digits.slice(-4).padStart(4, "0");
  // produce masked blocks
  const blocks = ["****", "****", "****", last4];
  return blocks;
}

export default function BankCard({ bankCard = [], activeAccountId = null }) {
  if (!bankCard || bankCard.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No accounts to display
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-6 py-5">
      {bankCard.map((account, i) => {
        const grad = gradients[i % gradients.length];
        const isActive = activeAccountId === account.id;
        const isPrimary = !!account.isPrimary;

        const blocks = formatCardBlocks(
          account.cardNumber || account.bankAccount || ""
        );

        const accountLabel = account.name || account.bankName || "Your Bank";
        const typeLabel =
          (account.type || "").toString().replaceAll("_", " ").toUpperCase() ||
          "--";
        const balanceVal = account.balance ?? account.currentBalance ?? null;
        const currency = account.currency || "INR";

        return (
          <Link
            key={account.id}
            href={`/bank-account/details/${account.id}`}
            aria-label={`Open details for ${accountLabel}`}
            className={`relative w-[320px] sm:w-[340px] h-[200px] sm:h-[210px] rounded-xl overflow-hidden group transform transition-transform duration-300 hover:scale-105 focus:scale-105 focus:outline-none
              ${grad}`}
          >
            {/* focus ring & active ring */}
            <div
              className={`absolute inset-0 rounded-xl ring-offset-2 pointer-events-none ${
                isActive
                  ? "ring-4 ring-green-500/70 dark:ring-green-700/60"
                  : ""
              }`}
            />

            {/* subtle inner border for contrast */}
            <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/8 dark:border-black/20" />

            {/* Top row: bank name & wifi icon */}
            <div className="relative z-20 px-5 pt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="text-white/95 font-semibold text-base sm:text-lg truncate"
                  title={accountLabel}
                >
                  {accountLabel}
                </div>
                {/* optional small subtitle */}
                {account.subtitle && (
                  <div className="text-white/80 text-xs truncate">
                    {account.subtitle}
                  </div>
                )}
              </div>

              <div
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/12 backdrop-blur-sm"
                aria-hidden
              >
                <Wifi className="w-4 h-4 text-white/85" />
              </div>
            </div>

            {/* Mastercard logo + account-type + badges (top-right) */}
            <div className="absolute top-3 right-4 z-30 flex flex-col items-center text-white select-none">
              <div className="flex items-center gap-0.5">
                <span className="block w-7 h-7 rounded-full bg-red-500 border-2 border-white/30 z-10" />
                <span className="block w-7 h-7 -ml-3 rounded-full bg-yellow-400 border-2 border-white/30 z-0" />
              </div>

              <div className="mt-1 text-[10px] font-semibold tracking-wide uppercase drop-shadow-sm">
                mastercard
              </div>

              <div className="mt-2 flex flex-col items-center gap-1">
                {isActive && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/90 text-white shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}
                {isPrimary && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/90 text-white shadow-sm">
                    <Star className="w-3 h-3" />
                    <span>Primary</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card number */}
            <div className="relative z-20 px-5 pt-14 font-mono text-[1.25rem] sm:text-2xl tracking-widest text-white/95">
              <div className="flex items-center select-none">
                {blocks.map((b, idx) => (
                  <span
                    key={idx}
                    className={`inline-block ${
                      idx < 3 ? "opacity-75 mr-2" : "font-bold"
                    }`}
                    aria-hidden
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom details panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-3 bg-black/22 dark:bg-black/45 backdrop-blur-sm">
              <div className="flex justify-between items-start text-xs text-white/90">
                <div>
                  <div className="font-semibold text-[11px] tracking-wide">
                    TYPE
                  </div>
                  <div className="font-mono text-sm">{typeLabel}</div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-[11px] tracking-wide">
                    BALANCE
                  </div>
                  <div className="font-mono text-sm">
                    {formatCurrency(balanceVal, currency)}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-end justify-between">
                <div className="text-white/95 text-sm font-medium truncate max-w-[55%]">
                  {account.branch || account.holderName || "Branch"}
                </div>

                <div className="flex items-center gap-2 text-white/95 text-sm font-semibold">
                  <CreditCard className="w-4 h-4" />
                  <div className="uppercase">{account.visa || currency}</div>
                </div>
              </div>
            </div>

            {/* Chip */}
            <div className="absolute left-5 top-12 w-10 h-8 rounded-sm bg-yellow-300/30 border border-white/8 z-20 transform rotate-2" />

            {/* subtle reflective sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl z-10 opacity-25 group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.06) 100%)",
              }}
            />

            {/* decorative bottom glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-16 w-56 h-56 rounded-full blur-3xl opacity-18 dark:opacity-30"
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
