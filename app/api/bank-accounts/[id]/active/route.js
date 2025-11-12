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

    // Update or create UserPreference with defaultAccountId
    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        defaultAccountId: id,
      },
      create: {
        userId: session.user.id,
        defaultAccountId: id,
      },
    });

    const account = await prisma.bankAccount.findUnique({
      where: { id },
    });

    return NextResponse.json({ account, preferences });
  } catch (error) {
    console.error("Error setting active account:", error);
    return NextResponse.json(
      { error: "Failed to set active account" },
      { status: 500 }
    );
  }
}

