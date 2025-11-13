/**
 * Excel Parser Utility
 *
 * This utility provides functions to parse Excel files and convert them to JSON format.
 * It handles data type conversion, validation, and error handling for bulk upload operations.
 */

// Properly import named exports from xlsx to avoid default import error
import * as XLSX from "xlsx";

/**
 * Parse an Excel file buffer and convert it to JSON array
 *
 * @param {Buffer} fileBuffer - The Excel file buffer
 * @param {string} sheetName - Optional sheet name (defaults to first sheet)
 * @returns {Array<Object>} Array of objects representing rows, with keys as column headers
 */
export function parseExcelToJSON(fileBuffer, sheetName = null) {
  try {
    // Read the workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Get the sheet name (use first sheet if not specified)
    const sheet = sheetName || workbook.SheetNames[0];

    if (!workbook.Sheets[sheet]) {
      throw new Error(`Sheet "${sheet}" not found in Excel file`);
    }

    // Convert sheet to JSON array
    // header: 1 means first row is headers, raw: false means convert values
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
      header: 1, // Use first row as headers
      raw: false, // Convert values to strings/numbers
      defval: "", // Default value for empty cells
    });

    // If no data, return empty array
    if (jsonData.length === 0) {
      return [];
    }

    // First row contains headers
    const headers = jsonData[0].map((header) => String(header || "").trim());

    // Convert remaining rows to objects
    const result = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowObj = {};

      // Map each cell to its header
      headers.forEach((header, index) => {
        if (header) {
          // Get cell value, trim whitespace
          const value =
            row[index] !== undefined ? String(row[index]).trim() : "";
          rowObj[header] = value === "" ? null : value;
        }
      });

      // Only add row if it has at least one non-empty value
      if (Object.values(rowObj).some((val) => val !== null && val !== "")) {
        result.push(rowObj);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Validate that required columns exist in the parsed data
 *
 * @param {Array<Object>} data - Parsed JSON data
 * @param {Array<string>} requiredColumns - Array of required column names
 * @returns {Object} Validation result with isValid and missingColumns
 */
export function validateColumns(data, requiredColumns) {
  if (data.length === 0) {
    return {
      isValid: false,
      missingColumns: requiredColumns,
      error: "Excel file is empty or has no data rows",
    };
  }

  // Get all column names from first row
  const existingColumns = Object.keys(data[0] || {});

  // Find missing columns
  const missingColumns = requiredColumns.filter(
    (col) => !existingColumns.includes(col)
  );

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    existingColumns,
  };
}

/**
 * Convert string date to Date object
 * Handles various date formats from Excel
 *
 * @param {string|Date} dateValue - Date string or Date object
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export function parseDate(dateValue) {
  if (!dateValue) return null;

  // If already a Date object, return it
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Convert to string and trim
  const dateStr = String(dateValue).trim();
  if (!dateStr) return null;

  // Try parsing as ISO date (YYYY-MM-DD)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(isoMatch[0]);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try parsing as Excel serial date (number)
  if (!isNaN(dateValue)) {
    if (XLSX.SSF && typeof XLSX.SSF.parse_date_code === "function") {
      const excelDate = XLSX.SSF.parse_date_code(parseFloat(dateValue));
      if (excelDate) {
        return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }
    }
  }

  // Try standard Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Convert string to number
 *
 * @param {string|number} value - Value to convert
 * @returns {number|null} Parsed number or null if invalid
 */
export function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }

  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

/**
 * Convert string to boolean
 *
 * @param {string|boolean} value - Value to convert
 * @returns {boolean|null} Parsed boolean or null if invalid
 */
export function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const str = String(value).toLowerCase().trim();
  if (str === "true" || str === "1" || str === "yes") {
    return true;
  }
  if (str === "false" || str === "0" || str === "no") {
    return false;
  }

  return null;
}

/**
 * Normalize column names (remove spaces, convert to camelCase)
 *
 * @param {string} columnName - Original column name
 * @returns {string} Normalized column name
 */
export function normalizeColumnName(columnName) {
  if (!columnName) return "";

  return String(columnName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/[^a-z0-9]/gi, "");
}
