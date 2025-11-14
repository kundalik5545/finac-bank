import { test, expect } from '@playwright/test';
import { BankAccountPage } from '../../pages/BankAccountPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('Bank Account Tests', () => {
  let bankAccountPage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bankAccountPage = new BankAccountPage(page);
    
    // Login before each test
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await bankAccountPage.waitForPageLoad();
  });

  test('should display bank account list page', async () => {
    await bankAccountPage.navigateToBankAccounts();
    await expect(bankAccountPage.page.locator(bankAccountPage.selectors.pageTitle)).toBeVisible();
  });

  test('should navigate to add bank account page', async ({ page }) => {
    await bankAccountPage.navigateToAddBankAccount();
    await expect(page).toHaveURL(/\/bank-account\/add/);
  });

  test('should create bank account with valid data', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    await bankAccountPage.navigateToAddBankAccount();
    await bankAccountPage.createBankAccount(accountData);
    await bankAccountPage.waitForSuccessMessage();
    
    // Verify account appears in list
    await bankAccountPage.navigateToBankAccounts();
    const accountExists = await bankAccountPage.verifyAccountExists(accountData.name);
    expect(accountExists).toBeTruthy();
  });

  test('should create different account types', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountTypes = ['BANK', 'WALLET', 'CASH', 'CREDIT_CARD'];
    
    for (const type of accountTypes) {
      const accountData = bankAccountsData.validBankAccounts.find(acc => acc.type === type);
      if (accountData) {
        await bankAccountPage.navigateToAddBankAccount();
        await bankAccountPage.createBankAccount(accountData);
        await bankAccountPage.waitForSuccessMessage();
        
        await bankAccountPage.navigateToBankAccounts();
        const accountExists = await bankAccountPage.verifyAccountExists(accountData.name);
        expect(accountExists).toBeTruthy();
      }
    }
  });

  test('should validate empty name field', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const invalidAccount = bankAccountsData.invalidBankAccounts.find(acc => acc.name === '');
    
    if (invalidAccount) {
      await bankAccountPage.navigateToAddBankAccount();
      await bankAccountPage.fillBankAccountForm(invalidAccount);
      await bankAccountPage.submitForm();
      
      const nameError = await bankAccountPage.getText(bankAccountPage.selectors.nameError);
      expect(nameError).toBeTruthy();
    }
  });

  test('should validate negative balance', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const invalidAccount = bankAccountsData.invalidBankAccounts.find(acc => acc.balance === -1000);
    
    if (invalidAccount) {
      await bankAccountPage.navigateToAddBankAccount();
      await bankAccountPage.fillBankAccountForm(invalidAccount);
      await bankAccountPage.submitForm();
      
      const balanceError = await bankAccountPage.getText(bankAccountPage.selectors.balanceError);
      expect(balanceError).toBeTruthy();
    }
  });

  test('should create account with optional fields', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = {
      name: 'Test Account',
      type: 'BANK',
      currency: 'INR',
      balance: 0,
      isActive: true,
      isPrimary: false,
    };
    
    await bankAccountPage.navigateToAddBankAccount();
    await bankAccountPage.createBankAccount(accountData);
    await bankAccountPage.waitForSuccessMessage();
  });
});

