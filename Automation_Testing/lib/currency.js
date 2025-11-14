/**
 * Currency utility functions for formatting and validation
 */

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (INR, USD)
 * @param {string} locale - Locale string
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Format amount without currency symbol
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string}
 */
export function formatAmount(amount, decimals = 2) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }

  return amount.toFixed(decimals);
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string
 * @returns {number}
 */
export function parseCurrency(currencyString) {
  if (!currencyString) {
    return 0;
  }

  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate amount is positive
 * @param {number} amount - Amount to validate
 * @returns {boolean}
 */
export function isValidAmount(amount) {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

/**
 * Validate amount is positive and greater than zero
 * @param {number} amount - Amount to validate
 * @returns {boolean}
 */
export function isValidPositiveAmount(amount) {
  return typeof amount === 'number' && !isNaN(amount) && amount > 0;
}

/**
 * Round amount to specified decimal places
 * @param {number} amount - Amount to round
 * @param {number} decimals - Number of decimal places
 * @returns {number}
 */
export function roundAmount(amount, decimals = 2) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 0;
  }

  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Convert amount to string with thousand separators
 * @param {number} amount - Amount to format
 * @returns {string}
 */
export function formatWithSeparators(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }

  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calculate percentage of amount
 * @param {number} amount - Base amount
 * @param {number} percentage - Percentage value
 * @returns {number}
 */
export function calculatePercentage(amount, percentage) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 0;
  }
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return 0;
  }

  return (amount * percentage) / 100;
}

/**
 * Add two amounts
 * @param {number} amount1 - First amount
 * @param {number} amount2 - Second amount
 * @returns {number}
 */
export function addAmounts(amount1, amount2) {
  const a1 = typeof amount1 === 'number' ? amount1 : parseFloat(amount1) || 0;
  const a2 = typeof amount2 === 'number' ? amount2 : parseFloat(amount2) || 0;
  return roundAmount(a1 + a2);
}

/**
 * Subtract amount2 from amount1
 * @param {number} amount1 - First amount
 * @param {number} amount2 - Second amount
 * @returns {number}
 */
export function subtractAmounts(amount1, amount2) {
  const a1 = typeof amount1 === 'number' ? amount1 : parseFloat(amount1) || 0;
  const a2 = typeof amount2 === 'number' ? amount2 : parseFloat(amount2) || 0;
  return roundAmount(a1 - a2);
}

/**
 * Compare two amounts
 * @param {number} amount1 - First amount
 * @param {number} amount2 - Second amount
 * @returns {number} - Returns -1 if amount1 < amount2, 0 if equal, 1 if amount1 > amount2
 */
export function compareAmounts(amount1, amount2) {
  const a1 = typeof amount1 === 'number' ? amount1 : parseFloat(amount1) || 0;
  const a2 = typeof amount2 === 'number' ? amount2 : parseFloat(amount2) || 0;
  
  if (a1 < a2) return -1;
  if (a1 > a2) return 1;
  return 0;
}

