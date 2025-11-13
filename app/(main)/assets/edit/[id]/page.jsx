import { notFound } from "next/navigation";
import EditAssetForm from "./_components/EditAssetForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";

export default async function EditAssetPage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const asset = await prisma.asset.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!asset) {
    notFound();
  }

  return <EditAssetForm asset={asset} />;
}

