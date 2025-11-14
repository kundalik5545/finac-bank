import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { BankAccountPage } from '../../pages/BankAccountPage.js';
import { TransactionsPage } from '../../pages/TransactionsPage.js';
import { CategoriesPage } from '../../pages/CategoriesPage.js';
import { BudgetsPage } from '../../pages/BudgetsPage.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('User Workflow Tests', () => {
  test('multi-page navigation workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForPageLoad();
    
    // Navigate through all main pages
    await dashboardPage.clickTransactionsLink();
    await expect(page).toHaveURL(/\/transactions/);
    
    await dashboardPage.clickBankAccountLink();
    await expect(page).toHaveURL(/\/bank-account/);
    
    await dashboardPage.clickCategoriesLink();
    await expect(page).toHaveURL(/\/categories/);
    
    await dashboardPage.clickBudgetsLink();
    await expect(page).toHaveURL(/\/budgets/);
    
    await dashboardPage.clickInvestmentsLink();
    await expect(page).toHaveURL(/\/investments/);
    
    await dashboardPage.clickAssetsLink();
    await expect(page).toHaveURL(/\/assets/);
    
    await dashboardPage.clickSettingsLink();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('create and verify bank account workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const bankAccountPage = new BankAccountPage(page);
    const TestDataHelper = (await import('../../fixtures/testData.js')).TestDataHelper;
    
    // Login
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    
    // Navigate to bank accounts
    await dashboardPage.clickBankAccountLink();
    await bankAccountPage.navigateToBankAccounts();
    
    // Create account
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    await bankAccountPage.clickAddBankAccount();
    await bankAccountPage.createBankAccount(accountData);
    await bankAccountPage.waitForSuccessMessage();
    
    // Verify account in list
    await bankAccountPage.navigateToBankAccounts();
    const accountExists = await bankAccountPage.verifyAccountExists(accountData.name);
    expect(accountExists).toBeTruthy();
  });

  test('create category and transaction workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const categoriesPage = new CategoriesPage(page);
    const transactionsPage = new TransactionsPage(page);
    const TestDataHelper = (await import('../../fixtures/testData.js')).TestDataHelper;
    const formatDate = (await import('../../lib/date.js')).formatDate;
    
    // Login
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    
    // Create category
    await dashboardPage.clickCategoriesLink();
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories[0];
    
    await categoriesPage.navigateToAddCategory();
    await categoriesPage.createCategory(category);
    await categoriesPage.waitForSuccessMessage();
    
    // Create transaction using the category
    await dashboardPage.clickTransactionsLink();
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions[0];
    transaction.date = formatDate(new Date());
    
    await transactionsPage.navigateToAddTransaction();
    await transactionsPage.createTransaction(transaction);
    await transactionsPage.waitForSuccessMessage();
    
    // Verify transaction in list
    await transactionsPage.navigateToTransactions();
    const transactionCount = await transactionsPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThan(0);
  });
});

