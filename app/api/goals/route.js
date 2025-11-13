import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addGoalSchema } from "@/lib/formSchema";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
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
    if (body.targetDate && typeof body.targetDate === "string") {
      body.targetDate = new Date(body.targetDate);
    }

    const validatedData = addGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        name: validatedData.name,
        targetAmount: validatedData.targetAmount,
        targetDate: validatedData.targetDate,
        description: validatedData.description || null,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

