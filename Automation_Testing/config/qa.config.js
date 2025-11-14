import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from automation_testing directory
dotenv.config({ path: resolve(__dirname, "..", ".env") });

// Debug: Log base URL (remove in production)
console.log(
  "🔧 QA Base URL loaded:",
  process.env.QA_BASE_URL ||
    process.env.BASE_URL ||
    "https://qa.finac-bank.com (default)"
);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ["html", { outputFolder: "reports/html-report" }],
    ["list"],
    ["allure-playwright", { outputFolder: "reports/allure-results" }],
  ],

  use: {
    baseURL:
      process.env.QA_BASE_URL ||
      process.env.BASE_URL ||
      "https://qa.finac-bank.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
