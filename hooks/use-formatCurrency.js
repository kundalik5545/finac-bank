import { useCallback } from "react";

/**
 * Custom hook to format numbers into currency strings
 * @param {string} locale - e.g. 'en-IN', 'en-US'
 * @param {string} currency - e.g. 'INR', 'USD'
 */
export function useFormatCurrency(locale = "en-IN", currency = "INR") {
  const formatCurrency = useCallback(
    (amount) => {
      if (amount === null || amount === undefined || isNaN(amount)) {
        return "";
      }
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    },
    [locale, currency]
  );

  return { formatCurrency };
}
