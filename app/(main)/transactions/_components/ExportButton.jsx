"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get all current filter parameters
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });

      const response = await fetch(`/api/transactions/export?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export transactions");
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "transactions.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Transactions exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}

