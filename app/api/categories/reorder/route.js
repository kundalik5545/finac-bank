import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { z } from "zod";

const reorderCategoriesSchema = z.array(
  z.object({
    id: z.string().uuid(),
    position: z.number().int().positive(),
  })
);

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
    const validatedData = reorderCategoriesSchema.parse(body);

    // Verify all categories belong to the user
    const categoryIds = validatedData.map((item) => item.id);
    const userCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (userCategories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "Some categories not found or don't belong to user" },
        { status: 403 }
      );
    }

    // Update all categories in a transaction
    await prisma.$transaction(
      validatedData.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering categories:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}

