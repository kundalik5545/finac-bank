import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { AssetsClient } from "./_components/AssetsClient";
import { getAssets } from "@/action/asset";

const AssetsPage = async () => {
  let assets = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      assets = await getAssets(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
  }

  // Calculate total current value
  const totalCurrentValue = assets.reduce((sum, asset) => {
    return sum + Number(asset.currentValue);
  }, 0);

  return (
    <div className="assets-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Assets
          </h1>
          {totalCurrentValue > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total Current Value: ₹
              {totalCurrentValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <Button>
          <Link
            href="/assets/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Asset
          </Link>
        </Button>
      </section>

      {/* Assets List Section */}
      <section className="py-5">
        <AssetsClient assets={assets} />
      </section>
    </div>
  );
};

export default AssetsPage;

