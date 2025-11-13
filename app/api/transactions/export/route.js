import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { transactionFilterSchema } from "@/lib/formSchema";

function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatCurrency(amount, currency = "INR") {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filterParams = Object.fromEntries(searchParams.entries());
    const filters = transactionFilterSchema.parse(filterParams);

    // Build where clause (same as GET /api/transactions)
    const where = {
      userId: session.user.id,
    };

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    }

    if (filters.bankAccountId) {
      where.bankAccountId = filters.bankAccountId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      where.amount = {};
      if (filters.amountMin !== undefined) {
        where.amount.gte = filters.amountMin;
      }
      if (filters.amountMax !== undefined) {
        where.amount.lte = filters.amountMax;
      }
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
        { comments: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Fetch all transactions (no pagination for export)
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        bankAccount: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        subCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    // Build CSV content
    const headers = [
      "Date",
      "Description",
      "Category",
      "Sub-Category",
      "Bank Account",
      "Type",
      "Amount",
      "Currency",
      "Status",
      "Payment Method",
      "Comments",
    ];

    const csvRows = [
      headers.map(escapeCSV).join(","),
      ...transactions.map((t) => {
        return [
          formatDate(t.date),
          escapeCSV(t.description || ""),
          escapeCSV(t.category?.name || ""),
          escapeCSV(t.subCategory?.name || ""),
          escapeCSV(t.bankAccount?.name || ""),
          escapeCSV(t.type),
          escapeCSV(Number(t.amount)),
          escapeCSV(t.currency),
          escapeCSV(t.status),
          escapeCSV(t.paymentMethod || ""),
          escapeCSV(t.comments || ""),
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    // Generate filename with date and filters
    const dateStr = new Date().toISOString().split("T")[0];
    let filename = `transactions-${dateStr}`;
    if (filters.dateFrom || filters.dateTo) {
      filename += `-filtered`;
    }
    filename += ".csv";

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}

