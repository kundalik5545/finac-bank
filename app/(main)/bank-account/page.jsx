import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import BankCard from "./_components/BankCard";
import { BankTable } from "./_components/BankTable";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

const BankAccountPage = async () => {
  let accounts = [];
  let totalBalance = 0;
  let activeAccountId = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      accounts = await prisma.bankAccount.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get active account ID from UserPreference
      const userPreference = await prisma.userPreference.findUnique({
        where: { userId: session.user.id },
      });
      activeAccountId = userPreference?.defaultAccountId || null;

      // Calculate total balance from active accounts
      totalBalance = accounts
        .filter((acc) => acc.isActive)
        .reduce((sum, acc) => sum + Number(acc.balance), 0);
    }
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
  }

  return (
    <div className="bank-account-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 ">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold ">
            Bank Account
          </h1>
          {totalBalance > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total Balance: ₹
              {totalBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <Button className="flex">
          <Link
            href="/bank-account/add"
            className="flex items-center justify-around"
          >
            <Plus size="icon" /> Add
          </Link>
        </Button>
      </section>

      {/* Card Section */}
      <section className="py-5">
        <BankCard bankCard={accounts} activeAccountId={activeAccountId} />
      </section>

      {/* Table section */}
      <section className="py-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold py-1">
          Bank Accounts List
        </h2>
        <BankTable
          bankCard={accounts}
          activeAccountId={activeAccountId}
          totalBalance={totalBalance}
        />
      </section>
    </div>
  );
};

export default BankAccountPage;
