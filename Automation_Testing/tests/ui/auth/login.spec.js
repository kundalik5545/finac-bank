import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../pages/LoginPage.js";
import { TestDataHelper } from "../../../fixtures/testData.js";
import { getTestUser, getInvalidTestUser } from "../../../fixtures/testUser.js";

test.describe("Login Tests", () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL);
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test("should display login page elements", async () => {
    await expect(
      loginPage.page.locator(loginPage.selectors.cardTitle)
    ).toBeVisible();
    await expect(
      loginPage.page.locator(loginPage.selectors.emailInput)
    ).toBeVisible();
    await expect(
      loginPage.page.locator(loginPage.selectors.passwordInput)
    ).toBeVisible();
    await expect(
      loginPage.page.locator(loginPage.selectors.signInButton)
    ).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    const user = getTestUser();
    await loginPage.login(user.email, user.password);
    await loginPage.waitForLoginSuccess();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should login successfully with test data", async ({ page }) => {
    const usersData = TestDataHelper.getUsersData();
    const validUser = usersData.validUsers[0];

    await loginPage.login(validUser.email, validUser.password);
    await loginPage.waitForLoginSuccess();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should show error for invalid credentials", async () => {
    const invalidUser = getInvalidTestUser();
    await loginPage.login(invalidUser.email, invalidUser.password);

    // Wait for error message (toast or error text)
    await loginPage.page.waitForTimeout(2000);
    // Error should be visible either as toast or form error
    const errorVisible = await loginPage.page
      .locator(
        '//*[contains(@role, "status")] | //*[contains(@class, "error")]'
      )
      .isVisible();
    expect(errorVisible).toBeTruthy();
  });

  test("should validate empty email field", async () => {
    await loginPage.enterPassword("Test123!");
    await loginPage.clickSignIn();

    const emailError = await loginPage.getEmailError();
    expect(emailError).toContain("Please enter a valid email address");
  });

  test("should validate empty password field", async () => {
    await loginPage.enterEmail("test@example.com");
    await loginPage.clickSignIn();

    const passwordError = await loginPage.getPasswordError();
    expect(passwordError).toBeTruthy();
  });

  test("should validate invalid email format", async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.invalidUsers.find(
      (u) => u.email === "invalid-email"
    );

    if (invalidUser) {
      await loginPage.enterEmail(invalidUser.email);
      await loginPage.enterPassword("Test123!");
      await loginPage.clickSignIn();

      const emailError = await loginPage.getEmailError();
      expect(emailError).toContain("valid email");
    }
  });

  test("should navigate to sign up page", async ({ page }) => {
    await loginPage.clickSignUpLink();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should navigate to home page", async ({ page }) => {
    await loginPage.clickGoHome();
    await expect(page).toHaveURL(/\/$/);
  });

  test("should test multiple invalid login scenarios", async () => {
    const usersData = TestDataHelper.getUsersData();

    for (const invalidUser of usersData.invalidUsers.slice(0, 3)) {
      await loginPage.navigateToLogin();

      if (invalidUser.email) {
        await loginPage.enterEmail(invalidUser.email);
      }
      if (invalidUser.password) {
        await loginPage.enterPassword(invalidUser.password);
      }

      await loginPage.clickSignIn();
      await loginPage.page.waitForTimeout(1000);

      // Should not redirect to dashboard
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain("/dashboard");
    }
  });
});
