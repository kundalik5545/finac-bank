import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateAssetSchema } from "@/lib/formSchema";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Convert date string to Date object if needed
    if (body.purchaseDate && typeof body.purchaseDate === "string") {
      body.purchaseDate = new Date(body.purchaseDate);
    }

    const validatedData = updateAssetSchema.parse(body);

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Prepare update data, only including provided fields
    const updateData = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.currentValue !== undefined)
      updateData.currentValue = validatedData.currentValue;
    if (validatedData.purchaseValue !== undefined)
      updateData.purchaseValue = validatedData.purchaseValue;
    if (validatedData.purchaseDate !== undefined)
      updateData.purchaseDate = validatedData.purchaseDate;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description || null;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes || null;

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error updating asset:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
