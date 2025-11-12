import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addBankSchema } from "@/lib/formSchema";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await prisma.bankAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get active account ID from UserPreference
    const userPreference = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Calculate total balance from active accounts
    const totalBalance = accounts
      .filter((acc) => acc.isActive)
      .reduce((sum, acc) => sum + Number(acc.balance), 0);

    return NextResponse.json({
      accounts,
      totalBalance,
      activeAccountId: userPreference?.defaultAccountId || null,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
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
    const validatedData = addBankSchema.parse(body);

    // If setting as primary, unset other primary accounts
    if (validatedData.isPrimary) {
      await prisma.bankAccount.updateMany({
        where: {
          userId: session.user.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const account = await prisma.bankAccount.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Error creating bank account:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    );
  }
}

