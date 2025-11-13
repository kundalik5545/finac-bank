/**
 * Price Service for fetching real-time prices
 * Uses free APIs with rate limiting considerations
 */

// Cache for price data to reduce API calls
const priceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached price or fetch new one
 */
function getCachedPrice(key) {
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  return null;
}

function setCachedPrice(key, price) {
  priceCache.set(key, { price, timestamp: Date.now() });
}

/**
 * Fetch stock price using Yahoo Finance (unofficial, free)
 * Note: This is a simple implementation. For production, consider using official APIs
 */
export async function fetchStockPrice(symbol) {
  try {
    // Check cache first
    const cached = getCachedPrice(`stock_${symbol}`);
    if (cached !== null) {
      return cached;
    }

    // Yahoo Finance API (unofficial, free)
    // Format: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stock price for ${symbol}`);
    }

    const data = await response.json();
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!price) {
      throw new Error(`Price not found for symbol ${symbol}`);
    }

    setCachedPrice(`stock_${symbol}`, price);
    return price;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch gold price (using a free API or manual update)
 * Note: Free gold price APIs are limited. This is a placeholder.
 * For production, consider using paid APIs or manual updates.
 */
export async function fetchGoldPrice() {
  try {
    // Check cache first
    const cached = getCachedPrice("gold");
    if (cached !== null) {
      return cached;
    }

    // Using a free API (example - you may need to replace with actual API)
    // This is a placeholder - replace with actual gold price API
    // Example: https://api.metals.live/v1/spot/gold
    const response = await fetch("https://api.metals.live/v1/spot/gold", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      // Fallback: return a default or throw error
      throw new Error("Failed to fetch gold price");
    }

    const data = await response.json();
    // Adjust based on actual API response structure
    const price = data.price || data.rate || null;

    if (!price) {
      throw new Error("Gold price not found in response");
    }

    setCachedPrice("gold", price);
    return price;
  } catch (error) {
    console.error("Error fetching gold price:", error);
    // Return null to allow manual updates
    return null;
  }
}

/**
 * Fetch crypto price using CoinGecko (free tier)
 */
export async function fetchCryptoPrice(symbol) {
  try {
    // Check cache first
    const cached = getCachedPrice(`crypto_${symbol}`);
    if (cached !== null) {
      return cached;
    }

    // CoinGecko free API
    // Format: https://api.coingecko.com/api/v3/simple/price?ids={id}&vs_currencies=usd
    // Note: symbol needs to be mapped to CoinGecko ID
    const coinGeckoId = symbol.toLowerCase();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch crypto price for ${symbol}`);
    }

    const data = await response.json();
    const price = data[coinGeckoId]?.usd;

    if (!price) {
      throw new Error(`Price not found for crypto ${symbol}`);
    }

    setCachedPrice(`crypto_${symbol}`, price);
    return price;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Update price for a specific investment based on its type
 */
export async function updateInvestmentPrice(investment) {
  try {
    let newPrice = null;

    switch (investment.type) {
      case "STOCKS":
        if (investment.symbol) {
          newPrice = await fetchStockPrice(investment.symbol);
        }
        break;
      case "GOLD":
        newPrice = await fetchGoldPrice();
        break;
      case "CRYPTO":
        if (investment.symbol) {
          newPrice = await fetchCryptoPrice(investment.symbol);
        }
        break;
      default:
        // For other types, price update is manual
        return null;
    }

    return newPrice;
  } catch (error) {
    console.error(
      `Error updating price for investment ${investment.id}:`,
      error
    );
    return null;
  }
}

/**
 * Batch update prices for all investments
 * Includes rate limiting to avoid API limits
 */
export async function updateAllPrices(investments) {
  const results = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < investments.length; i++) {
    const investment = investments[i];

    try {
      const newPrice = await updateInvestmentPrice(investment);
      if (newPrice !== null) {
        results.push({
          investmentId: investment.id,
          symbol: investment.symbol,
          newPrice,
          success: true,
        });
      } else {
        results.push({
          investmentId: investment.id,
          symbol: investment.symbol,
          success: false,
          error: "Price update not available for this type",
        });
      }
    } catch (error) {
      results.push({
        investmentId: investment.id,
        symbol: investment.symbol,
        success: false,
        error: error.message,
      });
    }

    // Rate limiting: wait 1 second between requests for free APIs
    if (i < investments.length - 1) {
      await delay(1000);
    }
  }

  return results;
}

/**
 * Clear price cache (useful for testing or forced refresh)
 */
export function clearPriceCache() {
  priceCache.clear();
}
