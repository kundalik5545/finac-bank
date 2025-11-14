import { BasePage } from "./BasePage.js";

/**
 * Sign Up Page Object Model
 * Contains all selectors and actions for the sign up page
 */
export class SignUpPage extends BasePage {
  constructor(page) {
    super(page);

    // XPath selectors
    this.selectors = {
      nameInput: '//input[@placeholder="Enter your name"]',
      emailInput: '//input[@type="email"]',
      passwordInput: '//input[@type="password"]',
      signUpButton: '//button[contains(text(), "Sign Up")]',
      signInLink: '//a[contains(text(), "Sign in")]',
      goHomeLink: '//span[contains(text(), "go home")]',
      cardTitle: '//h2[contains(text(), "Sign Up")]',
      nameLabel: '//label[contains(text(), "Name")]',
      emailLabel: '//label[contains(text(), "Email")]',
      passwordLabel: '//label[contains(text(), "Password")]',
      nameError:
        '//input[@placeholder="Enter your name"]/following-sibling::p[contains(@class, "text-red-500")]',
      emailError:
        '//input[@type="email"]/following-sibling::p[contains(@class, "text-red-500")]',
      passwordError:
        '//input[@type="password"]/following-sibling::p[contains(@class, "text-red-500")]',
      loadingSpinner:
        '//button[contains(@disabled, "")]//*[contains(@class, "animate-spin")]',
    };
  }

  /**
   * Navigate to sign up page
   */
  async navigateToSignUp() {
    await this.navigate("/sign-up");
    await this.waitForPageLoad();
  }

  /**
   * Enter name
   * @param {string} name - Full name
   */
  async enterName(name) {
    await this.type(this.selectors.nameInput, name);
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
   * Click Sign Up button
   */
  async clickSignUp() {
    await this.click(this.selectors.signUpButton);
  }

  /**
   * Sign up with user details
   * @param {string} name - Full name
   * @param {string} email - Email address
   * @param {string} password - Password
   */
  async signUp(name, email, password) {
    await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignUp();
  }

  /**
   * Click Sign In link
   */
  async clickSignInLink() {
    await this.click(this.selectors.signInLink);
  }

  /**
   * Click Go Home link
   */
  async clickGoHome() {
    await this.click(this.selectors.goHomeLink);
  }

  /**
   * Get name error message
   * @returns {Promise<string>}
   */
  async getNameError() {
    return await this.getText(this.selectors.nameError);
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
   * Wait for sign up to complete (redirect to dashboard)
   */
  async waitForSignUpSuccess() {
    await this.waitForURL(/\/dashboard/, 10000);
  }
}
