import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import BankCard from "./_components/BankCard";
import { BankTable } from "./_components/BankTable";
import Link from "next/link";

const BankAccountPage = async () => {
  const bankCard = [
    {
      id: "1",
      bankName: "State Bank Of India",
      bankShortName: "SBI",
      cardNumber: "5678 4567",
      holderName: "Kundalik R. Jadhav",
      validTill: "12/29",
      visa: "VISA",
      currentBalance: 456.0,
    },
    {
      id: "2",
      bankName: "Axis Bank Of India",
      bankShortName: "AXIS",
      cardNumber: "5678 4567",
      holderName: "Kundalik R. Jadhav",
      validTill: "12/29",
      visa: "VISA",
      currentBalance: 456.0,
    },
    {
      id: "3",
      bankName: "Paytm Bank Of India",
      bankShortName: "Paytm",
      cardNumber: "5678 4567",
      holderName: "Kundalik R. Jadhav",
      validTill: "12/29",
      visa: "VISA",
      currentBalance: 456.0,
    },
    {
      id: "4",
      bankName: "Satara Bank Of India",
      bankShortName: "SBI",
      cardNumber: "5678 4567",
      holderName: "Kundalik R. Jadhav",
      validTill: "12/29",
      visa: "VISA",
      currentBalance: 456.0,
    },
  ];

  return (
    <div className="bank-account-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 ">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold ">
          Bank Account
        </h1>
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
        <BankCard bankCard={bankCard} />
      </section>

      {/* Table section */}
      <section className="py-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold py-1">
          Bank Accounts List
        </h2>
        <BankTable bankCard={bankCard} />
      </section>
    </div>
  );
};

export default BankAccountPage;
