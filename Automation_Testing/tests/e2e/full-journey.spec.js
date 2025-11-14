import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/SignUpPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { BankAccountPage } from '../../pages/BankAccountPage.js';
import { TransactionsPage } from '../../pages/TransactionsPage.js';
import { CategoriesPage } from '../../pages/CategoriesPage.js';
import { BudgetsPage } from '../../pages/BudgetsPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { generateUniqueEmail } from '../../fixtures/testUser.js';
import { formatDate, getCurrentMonth, getCurrentYear } from '../../lib/date.js';

test.describe('Full User Journey Tests', () => {
  test('complete user workflow from signup to transaction creation', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);
    const bankAccountPage = new BankAccountPage(page);
    const transactionsPage = new TransactionsPage(page);
    const categoriesPage = new CategoriesPage(page);
    
    // Step 1: Sign Up
    const usersData = TestDataHelper.getUsersData();
    const signUpUser = usersData.signUpUsers[0];
    const uniqueEmail = generateUniqueEmail();
    
    await signUpPage.navigateToSignUp();
    await signUpPage.signUp(signUpUser.name, uniqueEmail, signUpUser.password);
    await signUpPage.waitForSignUpSuccess();
    
    // Step 2: Verify Dashboard
    await dashboardPage.verifyDashboardLoaded();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Step 3: Create Bank Account
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    await dashboardPage.clickBankAccountLink();
    await bankAccountPage.navigateToAddBankAccount();
    await bankAccountPage.createBankAccount(accountData);
    await bankAccountPage.waitForSuccessMessage();
    
    // Step 4: Create Category
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories[0];
    
    await dashboardPage.clickCategoriesLink();
    await categoriesPage.navigateToAddCategory();
    await categoriesPage.createCategory(category);
    await categoriesPage.waitForSuccessMessage();
    
    // Step 5: Create Transaction
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions[0];
    transaction.date = formatDate(new Date());
    
    await dashboardPage.clickTransactionsLink();
    await transactionsPage.navigateToAddTransaction();
    await transactionsPage.createTransaction(transaction);
    await transactionsPage.waitForSuccessMessage();
    
    // Step 6: Verify Transaction in List
    await transactionsPage.navigateToTransactions();
    const transactionCount = await transactionsPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThan(0);
  });

  test('user workflow - create budget and track expenses', async ({ page }) => {
    const loginPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);
    const budgetsPage = new BudgetsPage(page);
    const transactionsPage = new TransactionsPage(page);
    
    // Login
    const usersData = TestDataHelper.getUsersData();
    const user = usersData.validUsers[0];
    await loginPage.navigateToSignUp();
    await loginPage.login(user.email, user.password);
    
    // Create Budget
    const budgetsData = TestDataHelper.getBudgetsData();
    const budget = budgetsData.validBudgets[0];
    budget.month = getCurrentMonth();
    budget.year = getCurrentYear();
    
    await dashboardPage.clickBudgetsLink();
    await budgetsPage.navigateToAddBudget();
    await budgetsPage.createBudget(budget);
    await budgetsPage.waitForSuccessMessage();
    
    // Create Expense Transaction
    const transactionsData = TestDataHelper.getTransactionsData();
    const expense = transactionsData.validTransactions.find(t => t.type === 'EXPENSE');
    if (expense) {
      expense.date = formatDate(new Date());
      await dashboardPage.clickTransactionsLink();
      await transactionsPage.navigateToAddTransaction();
      await transactionsPage.createTransaction(expense);
      await transactionsPage.waitForSuccessMessage();
    }
  });
});

