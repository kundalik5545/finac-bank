"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table2, LayoutGrid } from "lucide-react";
import { AssetsTable } from "./AssetsTable";
import { AssetsCard } from "./AssetsCard";

export function AssetsClient({ assets: initialAssets }) {
  const [viewMode, setViewMode] = useState("table");
  const [assets] = useState(initialAssets);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          All Assets
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 size={16} className="mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid size={16} className="mr-2" />
            Card
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <AssetsTable assets={assets} />
      ) : (
        <AssetsCard assets={assets} />
      )}
    </div>
  );
}

