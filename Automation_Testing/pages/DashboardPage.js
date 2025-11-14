import { BasePage } from './BasePage.js';

/**
 * Dashboard Page Object Model
 * Contains all selectors and actions for the dashboard page
 */
export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // Navigation
      sidebar: '//aside[contains(@class, "sidebar")]',
      dashboardLink: '//a[contains(@href, "/dashboard")]',
      transactionsLink: '//a[contains(@href, "/transactions")]',
      bankAccountLink: '//a[contains(@href, "/bank-account")]',
      categoriesLink: '//a[contains(@href, "/categories")]',
      budgetsLink: '//a[contains(@href, "/budgets")]',
      investmentsLink: '//a[contains(@href, "/investments")]',
      assetsLink: '//a[contains(@href, "/assets")]',
      settingsLink: '//a[contains(@href, "/settings")]',
      
      // Dashboard elements
      pageTitle: '//h1 | //h2[contains(text(), "Dashboard")]',
      totalBalance: '//div[contains(text(), "Total Balance")] | //*[contains(text(), "Balance")]',
      incomeCard: '//div[contains(text(), "Income")] | //*[contains(text(), "Income")]',
      expenseCard: '//div[contains(text(), "Expense")] | //*[contains(text(), "Expense")]',
      chart: '//canvas | //*[contains(@class, "recharts")]',
      
      // Quick actions
      addTransactionButton: '//button[contains(text(), "Add Transaction")] | //a[contains(@href, "/transactions/add")]',
      addBankAccountButton: '//button[contains(text(), "Add Bank Account")] | //a[contains(@href, "/bank-account/add")]',
      
      // User menu
      userMenu: '//button[contains(@aria-label, "user")] | //*[contains(@class, "user-menu")]',
      userAvatar: '//*[contains(@class, "avatar")]',
      logoutButton: '//button[contains(text(), "Logout")] | //button[contains(text(), "Sign Out")]',
      
      // Theme toggle
      themeToggle: '//button[contains(@aria-label, "theme")] | //button[contains(@aria-label, "Toggle")]',
    };
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Click Transactions link in sidebar
   */
  async clickTransactionsLink() {
    await this.click(this.selectors.transactionsLink);
  }

  /**
   * Click Bank Account link in sidebar
   */
  async clickBankAccountLink() {
    await this.click(this.selectors.bankAccountLink);
  }

  /**
   * Click Categories link in sidebar
   */
  async clickCategoriesLink() {
    await this.click(this.selectors.categoriesLink);
  }

  /**
   * Click Budgets link in sidebar
   */
  async clickBudgetsLink() {
    await this.click(this.selectors.budgetsLink);
  }

  /**
   * Click Investments link in sidebar
   */
  async clickInvestmentsLink() {
    await this.click(this.selectors.investmentsLink);
  }

  /**
   * Click Assets link in sidebar
   */
  async clickAssetsLink() {
    await this.click(this.selectors.assetsLink);
  }

  /**
   * Click Settings link in sidebar
   */
  async clickSettingsLink() {
    await this.click(this.selectors.settingsLink);
  }

  /**
   * Click Add Transaction button
   */
  async clickAddTransaction() {
    await this.click(this.selectors.addTransactionButton);
  }

  /**
   * Click Add Bank Account button
   */
  async clickAddBankAccount() {
    await this.click(this.selectors.addBankAccountButton);
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.click(this.selectors.userMenu);
  }

  /**
   * Logout
   */
  async logout() {
    await this.openUserMenu();
    await this.click(this.selectors.logoutButton);
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    await this.click(this.selectors.themeToggle);
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyDashboardLoaded() {
    await this.waitForElement(this.selectors.pageTitle);
  }

  /**
   * Get total balance text
   * @returns {Promise<string>}
   */
  async getTotalBalance() {
    return await this.getText(this.selectors.totalBalance);
  }
}

