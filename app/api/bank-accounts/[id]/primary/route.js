import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if account exists and belongs to user
    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Unset all other primary accounts for this user
    await prisma.bankAccount.updateMany({
      where: {
        userId: session.user.id,
        isPrimary: true,
        id: { not: id },
      },
      data: {
        isPrimary: false,
      },
    });

    // Set this account as primary
    const account = await prisma.bankAccount.update({
      where: { id },
      data: { isPrimary: true },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error setting primary account:", error);
    return NextResponse.json(
      { error: "Failed to set primary account" },
      { status: 500 }
    );
  }
}

