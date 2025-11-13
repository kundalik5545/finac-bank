"use client";

/**
 * Bulk Upload Page
 *
 * This page allows users to bulk upload transactions, categories, and subcategories
 * from Excel files. It provides:
 * - Tab interface for switching between transaction, category, and subcategory uploads
 * - File upload with drag-and-drop support
 * - Download sample templates
 * - Progress indicators
 * - Error handling and result display
 * - First-time only check for categories
 * - Delete all functionality with confirmation dialogs
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BulkUploadPage() {
  // Tab state: 'transactions', 'categories', or 'subcategories'
  const [activeTab, setActiveTab] = useState("transactions");

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Transaction upload specific state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");

  // Category/Subcategory state
  const [categories, setCategories] = useState([]);
  const [categoriesExist, setCategoriesExist] = useState(false);
  const [createdCategories, setCreatedCategories] = useState([]);

  // Upload results state
  const [uploadResult, setUploadResult] = useState(null);

  // Delete confirmation dialogs
  const [showDeleteCategoriesDialog, setShowDeleteCategoriesDialog] =
    useState(false);
  const [showDeleteSubcategoriesDialog, setShowDeleteSubcategoriesDialog] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories to check if they exist
  useEffect(() => {
    if (activeTab === "categories" || activeTab === "subcategories") {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            setCategories(data.categories);
            setCategoriesExist(data.categories.length > 0);
          }
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
    }
  }, [activeTab]);

  // Fetch bank accounts for transaction upload
  useEffect(() => {
    if (activeTab === "transactions") {
      fetch("/api/bank-accounts")
        .then((res) => res.json())
        .then((data) => {
          if (data.accounts) {
            const activeAccounts = data.accounts.filter((acc) => acc.isActive);
            setBankAccounts(activeAccounts);
            if (data.activeAccountId) {
              setSelectedBankAccountId(data.activeAccountId);
            } else if (activeAccounts.length > 0) {
              setSelectedBankAccountId(activeAccounts[0].id);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching bank accounts:", error);
        });
    }
  }, [activeTab]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        toast.error("Please select an Excel file (.xlsx or .xls)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  // Handle file drop (drag and drop)
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        toast.error("Please drop an Excel file (.xlsx or .xls)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // For transactions, validate bank account if not in Excel
    if (activeTab === "transactions" && !selectedBankAccountId) {
      toast.error(
        "Please select a bank account or include it in your Excel file"
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      if (activeTab === "transactions" && selectedBankAccountId) {
        formData.append("bankAccountId", selectedBankAccountId);
      }

      // Determine API endpoint based on active tab
      const endpoint =
        activeTab === "transactions"
          ? "/api/transactions/bulk"
          : activeTab === "categories"
          ? "/api/categories/bulk"
          : "/api/subcategories/bulk";

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          ...result,
        });

        if (activeTab === "transactions") {
          toast.success(
            result.message ||
              `${result.success} transactions uploaded successfully`
          );
        } else if (activeTab === "categories") {
          toast.success(
            result.message ||
              `${result.categoriesCreated} categories uploaded successfully`
          );
          // Store created categories to display IDs
          if (result.categories) {
            setCreatedCategories(result.categories);
            setCategoriesExist(true);
            // Refresh categories list
            fetch("/api/categories")
              .then((res) => res.json())
              .then((data) => {
                if (data.categories) {
                  setCategories(data.categories);
                }
              });
          }
        } else {
          toast.success(
            result.message ||
              `${result.subCategoriesCreated} subcategories uploaded successfully`
          );
        }

        setTimeout(() => {
          setSelectedFile(null);
          if (activeTab !== "categories") {
            setUploadResult(null);
          }
        }, 5000);
      } else {
        setUploadResult({
          success: false,
          error: result.error || "Upload failed",
          details: result.details,
          ...result,
        });
        toast.error(
          result.error || "Upload failed. Please check the errors below."
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        error: "Failed to upload file",
        details: error.message,
      });
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Download sample template
  const handleDownloadSample = () => {
    let fileName;
    if (activeTab === "transactions") {
      fileName = "sample-transactions.xlsx";
    } else if (activeTab === "categories") {
      fileName = "sample-categories.xlsx";
    } else {
      fileName = "sample-subcategories.xlsx";
    }

    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${fileName}...`);
  };

  // Copy category ID to clipboard
  const copyCategoryId = (categoryId) => {
    navigator.clipboard.writeText(categoryId);
    toast.success("Category ID copied to clipboard!");
  };

  // Handle delete all categories
  const handleDeleteAllCategories = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/categories/delete-all", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          result.message ||
            "All categories and subcategories deleted successfully"
        );
        setCategoriesExist(false);
        setCategories([]);
        setCreatedCategories([]);
        setShowDeleteCategoriesDialog(false);
        // Refresh if on subcategories tab
        if (activeTab === "subcategories") {
          fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
              if (data.categories) {
                setCategories(data.categories);
              }
            });
        }
      } else {
        toast.error(result.error || "Failed to delete categories");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete categories");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete all subcategories
  const handleDeleteAllSubcategories = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/subcategories/delete-all", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          result.message || "All subcategories deleted successfully"
        );
        setShowDeleteSubcategoriesDialog(false);
      } else {
        toast.error(result.error || "Failed to delete subcategories");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete subcategories");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bulk-upload-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple transactions, categories, or subcategories at once
          using Excel files
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab("transactions");
            setSelectedFile(null);
            setUploadResult(null);
          }}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
            activeTab === "transactions"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Transactions
        </button>
        <button
          onClick={() => {
            setActiveTab("categories");
            setSelectedFile(null);
            setUploadResult(null);
          }}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
            activeTab === "categories"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Categories
        </button>
        <button
          onClick={() => {
            setActiveTab("subcategories");
            setSelectedFile(null);
            setUploadResult(null);
          }}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
            activeTab === "subcategories"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Subcategories
        </button>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === "transactions"
                  ? "Upload Transactions"
                  : activeTab === "categories"
                  ? "Upload Categories"
                  : "Upload Subcategories"}
              </CardTitle>
              <CardDescription>
                {activeTab === "transactions"
                  ? "Upload multiple transactions from an Excel file. Download the sample template to see the required format."
                  : activeTab === "categories"
                  ? "Upload multiple categories from an Excel file. This is only available for first-time setup. Download the sample template to see the required format."
                  : "Upload multiple subcategories from an Excel file. You need category IDs from your existing categories. Download the sample template to see the required format."}
              </CardDescription>
            </div>
            {/* Delete All Buttons */}
            {activeTab === "categories" && categoriesExist && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteCategoriesDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Categories
              </Button>
            )}
            {activeTab === "subcategories" && categoriesExist && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteSubcategoriesDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Subcategories
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First-time check message for categories */}
          {activeTab === "categories" && categoriesExist && (
            <div className="rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Categories already exist
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Bulk upload is only available for first-time setup. You
                    already have categories. Please use the "Add Category"
                    button on the Categories page to add new categories, or
                    delete all categories first to start over.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories list for subcategories tab */}
          {activeTab === "subcategories" && (
            <div className="space-y-2">
              <Label>Existing Categories (for reference)</Label>
              {categories.length > 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({cat.type})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {cat.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCategoryId(cat.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No categories found. Please upload categories first.
                </p>
              )}
            </div>
          )}

          {/* Bank Account Selector (Transactions only) */}
          {activeTab === "transactions" && (
            <div className="space-y-2">
              <Label htmlFor="bankAccount">
                Default Bank Account (Optional)
              </Label>
              <Select
                value={selectedBankAccountId}
                onValueChange={setSelectedBankAccountId}
              >
                <SelectTrigger id="bankAccount">
                  <SelectValue placeholder="Select a bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If bankAccountId is not provided in your Excel file, this
                account will be used for all transactions.
              </p>
            </div>
          )}

          {/* Download Sample Button */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadSample}>
              <Download className="mr-2 h-4 w-4" />
              Download Sample Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              selectedFile
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
              activeTab === "categories" &&
                categoriesExist &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-12 w-12 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadResult(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <Label
                    htmlFor="file-upload"
                    className={cn(
                      "cursor-pointer",
                      activeTab === "categories" &&
                        categoriesExist &&
                        "cursor-not-allowed"
                    )}
                  >
                    <span className="text-blue-600 dark:text-blue-400 hover:underline">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={activeTab === "categories" && categoriesExist}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Excel files only (.xlsx, .xls) • Max 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              isUploading ||
              (activeTab === "categories" && categoriesExist)
            }
            className="w-full"
            size="lg"
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>

          {/* Upload Results */}
          {uploadResult && (
            <div
              className={cn(
                "rounded-lg p-4 space-y-3",
                uploadResult.success
                  ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              )}
            >
              <div className="flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <h3 className="font-semibold">
                  {uploadResult.success ? "Upload Successful" : "Upload Failed"}
                </h3>
              </div>

              {uploadResult.success ? (
                <div className="space-y-2 text-sm">
                  {activeTab === "transactions" ? (
                    <>
                      <p>
                        <strong>{uploadResult.success}</strong> transactions
                        created successfully
                      </p>
                      {uploadResult.failed > 0 && (
                        <p className="text-orange-600 dark:text-orange-400">
                          <strong>{uploadResult.failed}</strong> transactions
                          failed
                        </p>
                      )}
                    </>
                  ) : activeTab === "categories" ? (
                    <>
                      <p>
                        <strong>{uploadResult.categoriesCreated}</strong>{" "}
                        categories created
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>{uploadResult.subCategoriesCreated}</strong>{" "}
                        subcategories created
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-red-600 dark:text-red-400">
                    {uploadResult.error}
                  </p>
                  {uploadResult.details && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {uploadResult.details}
                    </p>
                  )}
                </div>
              )}

              {/* Error Details */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-sm">Errors by Row:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                    {uploadResult.errors.slice(0, 10).map((error, index) => (
                      <div
                        key={index}
                        className="p-2 bg-white dark:bg-gray-800 rounded border"
                      >
                        <p className="font-medium">Row {error.row}:</p>
                        <p className="text-red-600 dark:text-red-400">
                          {error.error}
                        </p>
                      </div>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <p className="text-gray-500 text-center">
                        ... and {uploadResult.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category IDs Table (after successful category upload) */}
          {activeTab === "categories" &&
            uploadResult?.success &&
            uploadResult.categories &&
            uploadResult.categories.length > 0 && (
              <div className="mt-6 space-y-2">
                <Label>
                  Created Categories (Copy IDs for subcategory upload)
                </Label>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category ID</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResult.categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">
                            {cat.name}
                          </TableCell>
                          <TableCell>{cat.type}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {cat.id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCategoryId(cat.id)}
                              className="h-8"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {activeTab === "transactions" ? (
            <>
              <div>
                <h4 className="font-semibold mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>amount (number, required)</li>
                  <li>currency (INR/USD, required)</li>
                  <li>type (INCOME/EXPENSE/TRANSFER/INVESTMENT, required)</li>
                  <li>date (YYYY-MM-DD format, required)</li>
                  <li>status (PENDING/COMPLETED/FAILED, optional)</li>
                  <li>description (text, optional)</li>
                  <li>comments (text, optional)</li>
                  <li>bankAccountId (UUID, optional - can select in form)</li>
                  <li>categoryId (UUID, optional)</li>
                  <li>subCategoryId (UUID, optional)</li>
                  <li>paymentMethod (UPI/CASH/CARD/ONLINE/OTHER, optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Download the sample template to see the exact format</li>
                  <li>Dates must be in YYYY-MM-DD format</li>
                  <li>Amounts must be positive numbers</li>
                  <li>If bankAccountId is not in Excel, select one above</li>
                </ul>
              </div>
            </>
          ) : activeTab === "categories" ? (
            <>
              <div>
                <h4 className="font-semibold mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>name (required) - Category name</li>
                  <li>type (required) - INCOME/EXPENSE/TRANSFER/INVESTMENT</li>
                  <li>color (optional) - Hex color format: #RRGGBB</li>
                  <li>icon (optional) - Icon name (Lucide icon)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Download the sample template to see the exact format</li>
                  <li>Bulk upload is only available for first-time setup</li>
                  <li>
                    After upload, copy the category IDs to use in subcategory
                    upload
                  </li>
                  <li>Colors must be in hex format (e.g., #FF6B6B)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-semibold mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>categoryId (required) - UUID of existing category</li>
                  <li>name (required) - Subcategory name</li>
                  <li>color (optional) - Hex color format: #RRGGBB</li>
                  <li>icon (optional) - Icon name (Lucide icon)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Download the sample template to see the exact format</li>
                  <li>
                    You must have categories first before uploading
                    subcategories
                  </li>
                  <li>
                    Use category IDs from your existing categories (shown above)
                  </li>
                  <li>Colors must be in hex format (e.g., #FF6B6B)</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete All Categories Confirmation Dialog */}
      <Dialog
        open={showDeleteCategoriesDialog}
        onOpenChange={setShowDeleteCategoriesDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Categories</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all categories? This will also
              delete all subcategories. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteCategoriesDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllCategories}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Subcategories Confirmation Dialog */}
      <Dialog
        open={showDeleteSubcategoriesDialog}
        onOpenChange={setShowDeleteSubcategoriesDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Subcategories</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all subcategories? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteSubcategoriesDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllSubcategories}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
