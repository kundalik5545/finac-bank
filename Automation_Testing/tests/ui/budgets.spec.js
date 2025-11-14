import { test, expect } from '@playwright/test';
import { BudgetsPage } from '../../pages/BudgetsPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';
import { getCurrentMonth, getCurrentYear } from '../../lib/date.js';

test.describe('Budgets Tests', () => {
  let budgetsPage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    budgetsPage = new BudgetsPage(page);
    
    // Login before each test
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await budgetsPage.waitForPageLoad();
  });

  test('should display budgets list page', async () => {
    await budgetsPage.navigateToBudgets();
    await expect(budgetsPage.page.locator(budgetsPage.selectors.pageTitle)).toBeVisible();
  });

  test('should navigate to add budget page', async ({ page }) => {
    await budgetsPage.navigateToAddBudget();
    await expect(page).toHaveURL(/\/budgets\/add/);
  });

  test('should create budget with valid data', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const budget = budgetsData.validBudgets[0];
    budget.month = getCurrentMonth();
    budget.year = getCurrentYear();
    
    await budgetsPage.navigateToAddBudget();
    await budgetsPage.createBudget(budget);
    await budgetsPage.waitForSuccessMessage();
  });

  test('should validate empty amount field', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const invalidBudget = budgetsData.invalidBudgets.find(b => b.amount === 0);
    
    if (invalidBudget) {
      await budgetsPage.navigateToAddBudget();
      await budgetsPage.fillBudgetForm(invalidBudget);
      await budgetsPage.submitForm();
      
      const amountError = await budgetsPage.getText(budgetsPage.selectors.amountError);
      expect(amountError).toBeTruthy();
    }
  });

  test('should validate invalid month', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const invalidBudget = budgetsData.invalidBudgets.find(b => b.month === 0 || b.month === 13);
    
    if (invalidBudget) {
      await budgetsPage.navigateToAddBudget();
      await budgetsPage.fillBudgetForm(invalidBudget);
      await budgetsPage.submitForm();
      
      const monthError = await budgetsPage.getText(budgetsPage.selectors.monthError);
      expect(monthError).toBeTruthy();
    }
  });

  test('should validate alert threshold range', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const invalidBudget = budgetsData.invalidBudgets.find(b => b.alertThreshold === 101 || b.alertThreshold === -1);
    
    if (invalidBudget) {
      await budgetsPage.navigateToAddBudget();
      await budgetsPage.fillBudgetForm(invalidBudget);
      await budgetsPage.submitForm();
      
      // Should show validation error
      const errorVisible = await budgetsPage.page.locator('//*[contains(text(), "0 and 100")]').isVisible();
      expect(errorVisible).toBeTruthy();
    }
  });

  test('should create budget for different months', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const validBudget = budgetsData.validBudgets[0];
    
    for (let month = 1; month <= 3; month++) {
      const budget = { ...validBudget, month, year: getCurrentYear() };
      await budgetsPage.navigateToAddBudget();
      await budgetsPage.createBudget(budget);
      await budgetsPage.waitForSuccessMessage();
    }
  });
});

