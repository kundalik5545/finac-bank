import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read JSON file and return parsed data
 * @param {string} filePath - Path to JSON file (relative to project root)
 * @returns {object|array}
 */
export function readJSONFile(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
  }
}

/**
 * Write data to JSON file
 * @param {string} filePath - Path to JSON file (relative to project root)
 * @param {object|array} data - Data to write
 * @param {boolean} prettyPrint - Whether to format JSON with indentation
 */
export function writeJSONFile(filePath, data, prettyPrint = true) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonString = prettyPrint
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    fs.writeFileSync(fullPath, jsonString, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write JSON file ${filePath}: ${error.message}`);
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file (relative to project root)
 * @returns {boolean}
 */
export function fileExists(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

/**
 * Load test data from JSON file
 * @param {string} fileName - Name of the JSON file in test-data folder
 * @returns {object|array}
 */
export function loadTestData(fileName) {
  const filePath = path.join('test-data', fileName);
  return readJSONFile(filePath);
}

/**
 * Get all JSON files in a directory
 * @param {string} dirPath - Directory path (relative to project root)
 * @returns {string[]}
 */
export function getJSONFiles(dirPath) {
  try {
    const fullPath = path.resolve(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) {
      return [];
    }

    const files = fs.readdirSync(fullPath);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    throw new Error(`Failed to read directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path (relative to project root)
 */
export function ensureDirectory(dirPath) {
  try {
    const fullPath = path.resolve(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Delete file if it exists
 * @param {string} filePath - Path to file (relative to project root)
 */
export function deleteFile(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
  }
}

/**
 * Copy file from source to destination
 * @param {string} sourcePath - Source file path (relative to project root)
 * @param {string} destPath - Destination file path (relative to project root)
 */
export function copyFile(sourcePath, destPath) {
  try {
    const fullSourcePath = path.resolve(__dirname, '..', sourcePath);
    const fullDestPath = path.resolve(__dirname, '..', destPath);
    const destDir = path.dirname(fullDestPath);

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(fullSourcePath, fullDestPath);
  } catch (error) {
    throw new Error(`Failed to copy file from ${sourcePath} to ${destPath}: ${error.message}`);
  }
}

