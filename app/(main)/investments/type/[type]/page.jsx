import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvestmentByType } from "@/action/investment";
import TypeSpecificCharts from "./_components/TypeSpecificCharts";

const validTypes = [
  "STOCKS",
  "BONDS",
  "FIXED_DEPOSIT",
  "NPS",
  "PF",
  "GOLD",
  "MUTUAL_FUNDS",
  "CRYPTO",
  "REAL_ESTATE",
  "OTHER",
];

export default async function InvestmentTypePage({ params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { type } = await params;

  if (!session?.user) {
    notFound();
  }

  if (!validTypes.includes(type)) {
    notFound();
  }

  const data = await getInvestmentByType(session.user.id, type);

  return <TypeSpecificCharts data={data} type={type} />;
}

