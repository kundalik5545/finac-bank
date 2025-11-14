/**
 * Date utility functions for test data manipulation
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string}
 */
export function formatDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to DD/MM/YYYY
 * @param {Date} date - Date object
 * @returns {string}
 */
export function formatDateDDMMYYYY(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Get date N days from today
 * @param {number} days - Number of days (positive for future, negative for past)
 * @returns {Date}
 */
export function getDateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Get date N months from today
 * @param {number} months - Number of months (positive for future, negative for past)
 * @returns {Date}
 */
export function getDateFromTodayMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Get date N years from today
 * @param {number} years - Number of years (positive for future, negative for past)
 * @returns {Date}
 */
export function getDateFromTodayYears(years) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
}

/**
 * Get first day of current month
 * @returns {Date}
 */
export function getFirstDayOfMonth() {
  const date = new Date();
  date.setDate(1);
  return date;
}

/**
 * Get last day of current month
 * @returns {Date}
 */
export function getLastDayOfMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date;
}

/**
 * Get current month (1-12)
 * @returns {number}
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

/**
 * Get current year
 * @returns {number}
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
export function parseDate(dateString) {
  return new Date(dateString);
}

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isPastDate(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isFutureDate(date) {
  return new Date(date) > new Date();
}

/**
 * Get ISO string from date
 * @param {Date} date - Date object
 * @returns {string}
 */
export function toISOString(date = new Date()) {
  return new Date(date).toISOString();
}

/**
 * Get timestamp in milliseconds
 * @returns {number}
 */
export function getTimestamp() {
  return Date.now();
}

/**
 * Get unique date string for test data
 * @returns {string}
 */
export function getUniqueDateString() {
  return formatDate(new Date()) + '_' + getTimestamp();
}

