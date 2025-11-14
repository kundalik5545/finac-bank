import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../../pages/SignUpPage.js';
import { TestDataHelper } from '../../../fixtures/testData.js';
import { generateUniqueEmail } from '../../../fixtures/testUser.js';

test.describe('Sign Up Tests', () => {
  let signUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.navigateToSignUp();
  });

  test('should display sign up page elements', async () => {
    await expect(signUpPage.page.locator(signUpPage.selectors.cardTitle)).toBeVisible();
    await expect(signUpPage.page.locator(signUpPage.selectors.nameInput)).toBeVisible();
    await expect(signUpPage.page.locator(signUpPage.selectors.emailInput)).toBeVisible();
    await expect(signUpPage.page.locator(signUpPage.selectors.passwordInput)).toBeVisible();
    await expect(signUpPage.page.locator(signUpPage.selectors.signUpButton)).toBeVisible();
  });

  test('should sign up successfully with valid data', async ({ page }) => {
    const usersData = TestDataHelper.getUsersData();
    const signUpUser = usersData.signUpUsers[0];
    const uniqueEmail = generateUniqueEmail();
    
    await signUpPage.signUp(signUpUser.name, uniqueEmail, signUpUser.password);
    await signUpPage.waitForSignUpSuccess();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate empty name field', async () => {
    await signUpPage.enterEmail('test@example.com');
    await signUpPage.enterPassword('Test123!');
    await signUpPage.clickSignUp();
    
    const nameError = await signUpPage.getNameError();
    expect(nameError).toBeTruthy();
  });

  test('should validate name minimum length', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.name === '');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const nameError = await signUpPage.getNameError();
      expect(nameError).toContain('2 characters');
    }
  });

  test('should validate invalid email format', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.email === 'invalid-email');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const emailError = await signUpPage.getEmailError();
      expect(emailError).toContain('valid email');
    }
  });

  test('should validate password minimum length', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.password === 'short');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const passwordError = await signUpPage.getPasswordError();
      expect(passwordError).toContain('8 characters');
    }
  });

  test('should validate password requirements - uppercase', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.password === 'lowercase123');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const passwordError = await signUpPage.getPasswordError();
      expect(passwordError).toContain('uppercase');
    }
  });

  test('should validate password requirements - lowercase', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.password === 'UPPERCASE123');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const passwordError = await signUpPage.getPasswordError();
      expect(passwordError).toContain('lowercase');
    }
  });

  test('should validate password requirements - number', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.password === 'NoNumbers!');
    
    if (invalidUser) {
      await signUpPage.enterName(invalidUser.name);
      await signUpPage.enterEmail(invalidUser.email);
      await signUpPage.enterPassword(invalidUser.password);
      await signUpPage.clickSignUp();
      
      const passwordError = await signUpPage.getPasswordError();
      expect(passwordError).toContain('number');
    }
  });

  test('should navigate to sign in page', async ({ page }) => {
    await signUpPage.clickSignInLink();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should navigate to home page', async ({ page }) => {
    await signUpPage.clickGoHome();
    await expect(page).toHaveURL(/\/$/);
  });
});

