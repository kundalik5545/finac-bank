import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.prod' });

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
    baseURL: process.env.PROD_BASE_URL || 'https://finac-bank.com',
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

