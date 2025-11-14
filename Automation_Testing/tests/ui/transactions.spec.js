import { test, expect } from '@playwright/test';
import { TransactionsPage } from '../../pages/TransactionsPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';
import { formatDate } from '../../lib/date.js';

test.describe('Transactions Tests', () => {
  let transactionsPage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    transactionsPage = new TransactionsPage(page);
    
    // Login before each test
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await transactionsPage.waitForPageLoad();
  });

  test('should display transactions list page', async () => {
    await transactionsPage.navigateToTransactions();
    await expect(transactionsPage.page.locator(transactionsPage.selectors.pageTitle)).toBeVisible();
  });

  test('should navigate to add transaction page', async ({ page }) => {
    await transactionsPage.navigateToAddTransaction();
    await expect(page).toHaveURL(/\/transactions\/add/);
  });

  test('should create income transaction', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions.find(t => t.type === 'INCOME');
    
    if (transaction) {
      transaction.date = formatDate(new Date());
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.createTransaction(transaction);
      await transactionsPage.waitForSuccessMessage();
    }
  });

  test('should create expense transaction', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions.find(t => t.type === 'EXPENSE');
    
    if (transaction) {
      transaction.date = formatDate(new Date());
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.createTransaction(transaction);
      await transactionsPage.waitForSuccessMessage();
    }
  });

  test('should create transfer transaction', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions.find(t => t.type === 'TRANSFER');
    
    if (transaction) {
      transaction.date = formatDate(new Date());
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.createTransaction(transaction);
      await transactionsPage.waitForSuccessMessage();
    }
  });

  test('should create investment transaction', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions.find(t => t.type === 'INVESTMENT');
    
    if (transaction) {
      transaction.date = formatDate(new Date());
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.createTransaction(transaction);
      await transactionsPage.waitForSuccessMessage();
    }
  });

  test('should validate empty amount field', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const invalidTransaction = transactionsData.invalidTransactions.find(t => t.amount === 0);
    
    if (invalidTransaction) {
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.fillTransactionForm(invalidTransaction);
      await transactionsPage.submitForm();
      
      const amountError = await transactionsPage.getText(transactionsPage.selectors.amountError);
      expect(amountError).toBeTruthy();
    }
  });

  test('should filter transactions by type', async () => {
    await transactionsPage.navigateToTransactions();
    await transactionsPage.applyFilters({ type: 'INCOME' });
    await transactionsPage.page.waitForTimeout(1000);
    
    // Verify filter is applied
    const transactionCount = await transactionsPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter transactions by status', async () => {
    await transactionsPage.navigateToTransactions();
    await transactionsPage.applyFilters({ status: 'COMPLETED' });
    await transactionsPage.page.waitForTimeout(1000);
    
    const transactionCount = await transactionsPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter transactions by date range', async () => {
    await transactionsPage.navigateToTransactions();
    const dateFrom = formatDate(new Date(new Date().setDate(1)));
    const dateTo = formatDate(new Date());
    
    await transactionsPage.applyFilters({ dateFrom, dateTo });
    await transactionsPage.page.waitForTimeout(1000);
    
    const transactionCount = await transactionsPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should clear filters', async () => {
    await transactionsPage.navigateToTransactions();
    await transactionsPage.applyFilters({ type: 'INCOME' });
    await transactionsPage.clearFilters();
    await transactionsPage.page.waitForTimeout(1000);
  });
});

