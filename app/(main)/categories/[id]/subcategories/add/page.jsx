import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import SubCategoryForm from "../../../_components/SubCategoryForm";
import { notFound } from "next/navigation";

export default async function AddSubCategoryPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    notFound();
  }

  const { id } = await params;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!category) {
    notFound();
  }

  return <SubCategoryForm categoryId={id} />;
}

