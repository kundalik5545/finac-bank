import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from automation_testing directory
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// Debug: Log base URL (remove in production)
console.log('🔧 Prod Base URL loaded:', process.env.PROD_BASE_URL || process.env.BASE_URL || 'https://finac-bank.com (default)');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run sequentially in production
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1, // Single worker for production
  
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'reports/allure-results' }],
  ],
  
  use: {
    baseURL: process.env.PROD_BASE_URL || process.env.BASE_URL || 'https://finac-bank.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

