import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('Dashboard Tests', () => {
  let dashboardPage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login before each test
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForPageLoad();
  });

  test('should display dashboard page', async () => {
    await dashboardPage.verifyDashboardLoaded();
    await expect(dashboardPage.page.locator(dashboardPage.selectors.pageTitle)).toBeVisible();
  });

  test('should display sidebar navigation', async () => {
    await expect(dashboardPage.page.locator(dashboardPage.selectors.sidebar)).toBeVisible();
    await expect(dashboardPage.page.locator(dashboardPage.selectors.transactionsLink)).toBeVisible();
    await expect(dashboardPage.page.locator(dashboardPage.selectors.bankAccountLink)).toBeVisible();
    await expect(dashboardPage.page.locator(dashboardPage.selectors.categoriesLink)).toBeVisible();
    await expect(dashboardPage.page.locator(dashboardPage.selectors.budgetsLink)).toBeVisible();
  });

  test('should navigate to transactions page', async ({ page }) => {
    await dashboardPage.clickTransactionsLink();
    await expect(page).toHaveURL(/\/transactions/);
  });

  test('should navigate to bank account page', async ({ page }) => {
    await dashboardPage.clickBankAccountLink();
    await expect(page).toHaveURL(/\/bank-account/);
  });

  test('should navigate to categories page', async ({ page }) => {
    await dashboardPage.clickCategoriesLink();
    await expect(page).toHaveURL(/\/categories/);
  });

  test('should navigate to budgets page', async ({ page }) => {
    await dashboardPage.clickBudgetsLink();
    await expect(page).toHaveURL(/\/budgets/);
  });

  test('should navigate to investments page', async ({ page }) => {
    await dashboardPage.clickInvestmentsLink();
    await expect(page).toHaveURL(/\/investments/);
  });

  test('should navigate to assets page', async ({ page }) => {
    await dashboardPage.clickAssetsLink();
    await expect(page).toHaveURL(/\/assets/);
  });

  test('should navigate to settings page', async ({ page }) => {
    await dashboardPage.clickSettingsLink();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should display user menu', async () => {
    await expect(dashboardPage.page.locator(dashboardPage.selectors.userMenu)).toBeVisible();
  });

  test('should toggle theme', async () => {
    await dashboardPage.toggleTheme();
    // Theme toggle should work without error
    await dashboardPage.page.waitForTimeout(500);
  });
});

