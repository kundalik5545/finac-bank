import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { addSubCategorySchema } from "@/lib/formSchema";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId: id,
        userId: session.user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ subCategories });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub-categories" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const validatedData = addSubCategorySchema.parse({
      ...body,
      categoryId: id,
    });

    const subCategory = await prisma.subCategory.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        icon: validatedData.icon,
        categoryId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ subCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

