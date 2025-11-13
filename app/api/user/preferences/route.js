import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await prisma.userPreference.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId: session.user.id,
          currency: "INR",
          emailNotifications: true,
          budgetAlerts: true,
          telegramNotifications: false,
          budgetAlertThreshold: 80,
        },
      });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      budgetAlerts,
      telegramNotifications,
      telegramChatId,
      budgetAlertThreshold,
    } = body;

    // Update or create preferences
    const preferences = await prisma.userPreference.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(budgetAlerts !== undefined && { budgetAlerts }),
        ...(telegramNotifications !== undefined && { telegramNotifications }),
        ...(telegramChatId !== undefined && { telegramChatId: telegramChatId || null }),
        ...(budgetAlertThreshold !== undefined && { budgetAlertThreshold }),
      },
      create: {
        userId: session.user.id,
        currency: "INR",
        emailNotifications: emailNotifications ?? true,
        budgetAlerts: budgetAlerts ?? true,
        telegramNotifications: telegramNotifications ?? false,
        telegramChatId: telegramChatId || null,
        budgetAlertThreshold: budgetAlertThreshold ?? 80,
      },
    });

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

