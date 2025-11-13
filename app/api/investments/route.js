import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addInvestmentSchema } from "@/lib/formSchema";

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
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    const where = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const investments = await prisma.investment.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ investments });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Convert date string to Date object if needed
    if (body.purchaseDate && typeof body.purchaseDate === "string") {
      body.purchaseDate = new Date(body.purchaseDate);
    }

    const validatedData = addInvestmentSchema.parse(body);

    // Handle nullable fields
    const data = {
      name: validatedData.name,
      type: validatedData.type,
      symbol: validatedData.symbol || null,
      quantity: validatedData.quantity,
      purchasePrice: validatedData.purchasePrice,
      currentPrice: validatedData.currentPrice || null,
      purchaseDate: validatedData.purchaseDate,
      categoryId: validatedData.categoryId || null,
      subCategoryId: validatedData.subCategoryId || null,
      description: validatedData.description || null,
      notes: validatedData.notes || null,
      userId: session.user.id,
    };

    const investment = await prisma.investment.create({
      data,
      include: {
        category: true,
        subCategory: true,
      },
    });

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    console.error("Error creating investment:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}

