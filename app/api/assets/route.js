import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addAssetSchema } from "@/lib/formSchema";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
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

    const validatedData = addAssetSchema.parse(body);

    const asset = await prisma.asset.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        currentValue: validatedData.currentValue,
        purchaseValue: validatedData.purchaseValue,
        purchaseDate: validatedData.purchaseDate,
        description: validatedData.description || null,
        notes: validatedData.notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}

