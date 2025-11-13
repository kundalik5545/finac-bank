import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  fetchStockPrice,
  fetchCryptoPrice,
  fetchGoldPrice,
} from "@/lib/price-service";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "STOCKS";

    let price = null;

    try {
      switch (type.toUpperCase()) {
        case "STOCKS":
          price = await fetchStockPrice(symbol);
          break;
        case "CRYPTO":
          price = await fetchCryptoPrice(symbol);
          break;
        case "GOLD":
          price = await fetchGoldPrice();
          break;
        default:
          return NextResponse.json(
            { error: "Invalid type. Use STOCKS, CRYPTO, or GOLD" },
            { status: 400 }
          );
      }

      return NextResponse.json({
        symbol,
        type: type.toUpperCase(),
        price,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch price" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching price:", error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
