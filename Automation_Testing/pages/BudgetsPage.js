import { BasePage } from './BasePage.js';

/**
 * Budgets Page Object Model
 * Contains all selectors and actions for budgets pages
 */
export class BudgetsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Budget")] | //h2[contains(text(), "Budget")]',
      addBudgetButton: '//a[contains(@href, "/budgets/add")] | //button[contains(text(), "Add Budget")]',
      budgetCard: '//div[contains(@class, "budget")] | //*[contains(@class, "card")]',
      budgetAmount: '//*[contains(@class, "amount")]',
      budgetMonth: '//*[contains(@class, "month")]',
      budgetProgress: '//*[contains(@class, "progress")]',
      
      // Add/Edit form
      amountInput: '//input[@id="amount"] | //input[@type="number"][contains(@placeholder, "Amount")]',
      monthSelect: '//select[@id="month"] | //button[contains(@role, "combobox")][contains(., "Month")]',
      yearInput: '//input[@id="year"] | //input[@type="number"][contains(@placeholder, "Year")]',
      categorySelect: '//select[@id="categoryId"] | //button[contains(@role, "combobox")][contains(., "Category")]',
      alertThresholdInput: '//input[@id="alertThreshold"] | //input[@type="number"][contains(@placeholder, "Alert")]',
      descriptionInput: '//input[@id="description"] | //textarea[@id="description"]',
      isActiveCheckbox: '//input[@id="isActive"] | //input[@type="checkbox"][@id="isActive"]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Budget")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      amountError: '//input[@id="amount"]/following-sibling::p[contains(@class, "text-red-500")]',
      monthError: '//select[@id="month"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Actions
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to budgets list page
   */
  async navigateToBudgets() {
    await this.navigate('/budgets');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add budget page
   */
  async navigateToAddBudget() {
    await this.navigate('/budgets/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Budget button
   */
  async clickAddBudget() {
    await this.click(this.selectors.addBudgetButton);
  }

  /**
   * Fill budget form
   * @param {object} budgetData - Budget data
   */
  async fillBudgetForm(budgetData) {
    if (budgetData.amount !== undefined) {
      await this.type(this.selectors.amountInput, String(budgetData.amount));
    }
    if (budgetData.month) {
      await this.selectOption(this.selectors.monthSelect, String(budgetData.month));
    }
    if (budgetData.year) {
      await this.type(this.selectors.yearInput, String(budgetData.year));
    }
    if (budgetData.categoryId) {
      await this.selectOption(this.selectors.categorySelect, budgetData.categoryId);
    }
    if (budgetData.alertThreshold !== undefined) {
      await this.type(this.selectors.alertThresholdInput, String(budgetData.alertThreshold));
    }
    if (budgetData.description) {
      await this.type(this.selectors.descriptionInput, budgetData.description);
    }
    if (budgetData.isActive !== undefined) {
      await this.setCheckbox(this.selectors.isActiveCheckbox, budgetData.isActive);
    }
  }

  /**
   * Submit budget form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create budget
   * @param {object} budgetData - Budget data
   */
  async createBudget(budgetData) {
    await this.fillBudgetForm(budgetData);
    await this.submitForm();
  }

  /**
   * Verify budget exists
   * @param {number} month - Budget month
   * @param {number} year - Budget year
   * @returns {Promise<boolean>}
   */
  async verifyBudgetExists(month, year) {
    const budgetCard = this.page.locator(`//div[contains(., "${month}/${year}")]`);
    return await budgetCard.isVisible();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

