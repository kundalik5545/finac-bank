import { test, expect } from '@playwright/test';
import { CategoriesPage } from '../../pages/CategoriesPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('Categories Tests', () => {
  let categoriesPage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    categoriesPage = new CategoriesPage(page);
    
    // Login before each test
    const user = getTestUser();
    await loginPage.navigateToLogin();
    await loginPage.login(user.email, user.password);
    await categoriesPage.waitForPageLoad();
  });

  test('should display categories list page', async () => {
    await categoriesPage.navigateToCategories();
    await expect(categoriesPage.page.locator(categoriesPage.selectors.pageTitle)).toBeVisible();
  });

  test('should navigate to add category page', async ({ page }) => {
    await categoriesPage.navigateToAddCategory();
    await expect(page).toHaveURL(/\/categories\/add/);
  });

  test('should create expense category', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories.find(c => c.type === 'EXPENSE');
    
    if (category) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.createCategory(category);
      await categoriesPage.waitForSuccessMessage();
      
      await categoriesPage.navigateToCategories();
      const categoryExists = await categoriesPage.verifyCategoryExists(category.name);
      expect(categoryExists).toBeTruthy();
    }
  });

  test('should create income category', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories.find(c => c.type === 'INCOME');
    
    if (category) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.createCategory(category);
      await categoriesPage.waitForSuccessMessage();
    }
  });

  test('should create transfer category', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories.find(c => c.type === 'TRANSFER');
    
    if (category) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.createCategory(category);
      await categoriesPage.waitForSuccessMessage();
    }
  });

  test('should create investment category', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories.find(c => c.type === 'INVESTMENT');
    
    if (category) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.createCategory(category);
      await categoriesPage.waitForSuccessMessage();
    }
  });

  test('should validate empty name field', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const invalidCategory = categoriesData.invalidCategories.find(c => c.name === '');
    
    if (invalidCategory) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.fillCategoryForm(invalidCategory);
      await categoriesPage.submitForm();
      
      const nameError = await categoriesPage.getText(categoriesPage.selectors.nameError);
      expect(nameError).toBeTruthy();
    }
  });

  test('should validate invalid color format', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const invalidCategory = categoriesData.invalidCategories.find(c => c.color === 'invalid-color');
    
    if (invalidCategory) {
      await categoriesPage.navigateToAddCategory();
      await categoriesPage.fillCategoryForm(invalidCategory);
      await categoriesPage.submitForm();
      
      const colorError = await categoriesPage.page.locator('//*[contains(text(), "hex color")]').isVisible();
      expect(colorError).toBeTruthy();
    }
  });
});

