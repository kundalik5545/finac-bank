import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addCategorySchema } from "@/lib/formSchema";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subCategories: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: [
        {
          position: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    // Initialize positions for categories that don't have one
    const categoriesWithoutPosition = categories.filter((cat) => cat.position === null);
    if (categoriesWithoutPosition.length > 0) {
      const maxPosition = Math.max(
        ...categories
          .filter((cat) => cat.position !== null)
          .map((cat) => cat.position),
        0
      );

      await prisma.$transaction(
        categoriesWithoutPosition.map((cat, index) =>
          prisma.category.update({
            where: { id: cat.id },
            data: { position: maxPosition + index + 1 },
          })
        )
      );

      // Refetch categories with updated positions
      categories = await prisma.category.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          subCategories: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: [
          {
            position: "asc",
          },
          {
            name: "asc",
          },
        ],
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedData = addCategorySchema.parse(body);

    // Get the maximum position for this user's categories
    const maxPositionCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    const nextPosition = maxPositionCategory?.position
      ? maxPositionCategory.position + 1
      : 1;

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        position: nextPosition,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

