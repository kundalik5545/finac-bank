import { BasePage } from './BasePage.js';

/**
 * Login Page Object Model
 * Contains all selectors and actions for the login page
 */
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      emailInput: '//input[@type="email"]',
      passwordInput: '//input[@type="password"]',
      signInButton: '//button[contains(text(), "Sign In")]',
      signUpLink: '//a[contains(text(), "Sign up")]',
      goHomeLink: '//span[contains(text(), "go home")]',
      cardTitle: '//h2[contains(text(), "Sign In")]',
      emailLabel: '//label[contains(text(), "Email")]',
      passwordLabel: '//label[contains(text(), "Password")]',
      emailError: '//input[@type="email"]/following-sibling::p[contains(@class, "text-red-500")]',
      passwordError: '//input[@type="password"]/following-sibling::p[contains(@class, "text-red-500")]',
      loadingSpinner: '//button[contains(@disabled, "")]//*[contains(@class, "animate-spin")]',
    };
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.navigate('/sign-in');
    await this.waitForPageLoad();
  }

  /**
   * Enter email address
   * @param {string} email - Email address
   */
  async enterEmail(email) {
    await this.type(this.selectors.emailInput, email);
  }

  /**
   * Enter password
   * @param {string} password - Password
   */
  async enterPassword(password) {
    await this.type(this.selectors.passwordInput, password);
  }

  /**
   * Click Sign In button
   */
  async clickSignIn() {
    await this.click(this.selectors.signInButton);
  }

  /**
   * Login with credentials
   * @param {string} email - Email address
   * @param {string} password - Password
   */
  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  /**
   * Click Sign Up link
   */
  async clickSignUpLink() {
    await this.click(this.selectors.signUpLink);
  }

  /**
   * Click Go Home link
   */
  async clickGoHome() {
    await this.click(this.selectors.goHomeLink);
  }

  /**
   * Get email error message
   * @returns {Promise<string>}
   */
  async getEmailError() {
    return await this.getText(this.selectors.emailError);
  }

  /**
   * Get password error message
   * @returns {Promise<string>}
   */
  async getPasswordError() {
    return await this.getText(this.selectors.passwordError);
  }

  /**
   * Check if loading spinner is visible
   * @returns {Promise<boolean>}
   */
  async isLoading() {
    return await this.isVisible(this.selectors.loadingSpinner);
  }

  /**
   * Wait for login to complete (redirect to dashboard)
   */
  async waitForLoginSuccess() {
    await this.waitForURL(/\/dashboard/, 10000);
  }
}

