import { BasePage } from './BasePage.js';

/**
 * Investments Page Object Model
 * Contains all selectors and actions for investments pages
 */
export class InvestmentsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Investment")] | //h2[contains(text(), "Investment")]',
      addInvestmentButton: '//a[contains(@href, "/investments/add")] | //button[contains(text(), "Add Investment")]',
      investmentCard: '//div[contains(@class, "investment")] | //*[contains(@class, "card")]',
      investmentName: '//*[contains(@class, "investment-name")] | //h3 | //h4',
      investmentType: '//*[contains(@class, "type")]',
      investmentValue: '//*[contains(@class, "value")]',
      
      // Add/Edit form
      nameInput: '//input[@id="name"] | //input[@placeholder*="Name" or @placeholder*="Investment Name"]',
      typeSelect: '//select[@id="type"] | //button[contains(@role, "combobox")][contains(., "Type")]',
      symbolInput: '//input[@id="symbol"] | //input[@placeholder*="Symbol"]',
      quantityInput: '//input[@id="quantity"] | //input[@type="number"][contains(@placeholder, "Quantity")]',
      purchasePriceInput: '//input[@id="purchasePrice"] | //input[@type="number"][contains(@placeholder, "Purchase Price")]',
      currentPriceInput: '//input[@id="currentPrice"] | //input[@type="number"][contains(@placeholder, "Current Price")]',
      purchaseDateInput: '//input[@id="purchaseDate"] | //input[@type="date"]',
      categorySelect: '//select[@id="categoryId"] | //button[contains(@role, "combobox")][contains(., "Category")]',
      subCategorySelect: '//select[@id="subCategoryId"] | //button[contains(@role, "combobox")][contains(., "Sub Category")]',
      descriptionInput: '//input[@id="description"] | //textarea[@id="description"]',
      notesInput: '//input[@id="notes"] | //textarea[@id="notes"]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Investment")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      nameError: '//input[@id="name"]/following-sibling::p[contains(@class, "text-red-500")]',
      quantityError: '//input[@id="quantity"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Actions
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      viewDetailsButton: '//button[contains(text(), "View")] | //a[contains(@href, "/details")]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to investments list page
   */
  async navigateToInvestments() {
    await this.navigate('/investments');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add investment page
   */
  async navigateToAddInvestment() {
    await this.navigate('/investments/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Investment button
   */
  async clickAddInvestment() {
    await this.click(this.selectors.addInvestmentButton);
  }

  /**
   * Fill investment form
   * @param {object} investmentData - Investment data
   */
  async fillInvestmentForm(investmentData) {
    if (investmentData.name) {
      await this.type(this.selectors.nameInput, investmentData.name);
    }
    if (investmentData.type) {
      await this.selectOption(this.selectors.typeSelect, investmentData.type);
    }
    if (investmentData.symbol) {
      await this.type(this.selectors.symbolInput, investmentData.symbol);
    }
    if (investmentData.quantity !== undefined) {
      await this.type(this.selectors.quantityInput, String(investmentData.quantity));
    }
    if (investmentData.purchasePrice !== undefined) {
      await this.type(this.selectors.purchasePriceInput, String(investmentData.purchasePrice));
    }
    if (investmentData.currentPrice !== undefined) {
      await this.type(this.selectors.currentPriceInput, String(investmentData.currentPrice));
    }
    if (investmentData.purchaseDate) {
      await this.type(this.selectors.purchaseDateInput, investmentData.purchaseDate);
    }
    if (investmentData.categoryId) {
      await this.selectOption(this.selectors.categorySelect, investmentData.categoryId);
    }
    if (investmentData.subCategoryId) {
      await this.selectOption(this.selectors.subCategorySelect, investmentData.subCategoryId);
    }
    if (investmentData.description) {
      await this.type(this.selectors.descriptionInput, investmentData.description);
    }
    if (investmentData.notes) {
      await this.type(this.selectors.notesInput, investmentData.notes);
    }
  }

  /**
   * Submit investment form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create investment
   * @param {object} investmentData - Investment data
   */
  async createInvestment(investmentData) {
    await this.fillInvestmentForm(investmentData);
    await this.submitForm();
  }

  /**
   * Verify investment exists
   * @param {string} investmentName - Name of the investment
   * @returns {Promise<boolean>}
   */
  async verifyInvestmentExists(investmentName) {
    const investmentCard = this.page.locator(`//div[contains(., "${investmentName}")]`);
    return await investmentCard.isVisible();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

