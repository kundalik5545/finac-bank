import { BasePage } from './BasePage.js';

/**
 * Transactions Page Object Model
 * Contains all selectors and actions for transactions pages
 */
export class TransactionsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Transaction")] | //h2[contains(text(), "Transaction")]',
      addTransactionButton: '//a[contains(@href, "/transactions/add")] | //button[contains(text(), "Add Transaction")]',
      transactionRow: '//tr[contains(@class, "transaction")] | //div[contains(@class, "transaction")]',
      transactionAmount: '//*[contains(@class, "amount")]',
      transactionDescription: '//*[contains(@class, "description")]',
      transactionDate: '//*[contains(@class, "date")]',
      transactionType: '//*[contains(@class, "type")]',
      
      // Filters
      dateFromInput: '//input[@placeholder*="From" or @name="dateFrom"]',
      dateToInput: '//input[@placeholder*="To" or @name="dateTo"]',
      typeFilter: '//select[@name="type"] | //button[contains(@role, "combobox")][contains(., "Type")]',
      statusFilter: '//select[@name="status"] | //button[contains(@role, "combobox")][contains(., "Status")]',
      bankAccountFilter: '//select[@name="bankAccountId"] | //button[contains(@role, "combobox")][contains(., "Bank Account")]',
      categoryFilter: '//select[@name="categoryId"] | //button[contains(@role, "combobox")][contains(., "Category")]',
      searchInput: '//input[@placeholder*="Search" or @type="search"]',
      applyFilterButton: '//button[contains(text(), "Apply")] | //button[contains(text(), "Filter")]',
      clearFilterButton: '//button[contains(text(), "Clear")] | //button[contains(text(), "Reset")]',
      
      // Add/Edit form
      amountInput: '//input[@id="amount"] | //input[@type="number"][contains(@placeholder, "Amount")]',
      currencySelect: '//select[@id="currency"] | //button[contains(@role, "combobox")][contains(., "Currency")]',
      transactionTypeSelect: '//select[@id="type"] | //button[contains(@role, "combobox")][contains(., "Type")]',
      statusSelect: '//select[@id="status"] | //button[contains(@role, "combobox")][contains(., "Status")]',
      dateInput: '//input[@id="date"] | //input[@type="date"]',
      descriptionInput: '//input[@id="description"] | //textarea[@id="description"] | //input[@placeholder*="Description"]',
      commentsInput: '//input[@id="comments"] | //textarea[@id="comments"]',
      bankAccountSelect: '//select[@id="bankAccountId"] | //button[contains(@role, "combobox")][contains(., "Bank Account")]',
      categorySelect: '//select[@id="categoryId"] | //button[contains(@role, "combobox")][contains(., "Category")]',
      subCategorySelect: '//select[@id="subCategoryId"] | //button[contains(@role, "combobox")][contains(., "Sub Category")]',
      paymentMethodSelect: '//select[@id="paymentMethod"] | //button[contains(@role, "combobox")][contains(., "Payment Method")]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Transaction")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      amountError: '//input[@id="amount"]/following-sibling::p[contains(@class, "text-red-500")]',
      dateError: '//input[@id="date"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Actions
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      viewDetailsButton: '//button[contains(text(), "View")] | //a[contains(@href, "/details")]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to transactions list page
   */
  async navigateToTransactions() {
    await this.navigate('/transactions');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add transaction page
   */
  async navigateToAddTransaction() {
    await this.navigate('/transactions/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Transaction button
   */
  async clickAddTransaction() {
    await this.click(this.selectors.addTransactionButton);
  }

  /**
   * Fill transaction form
   * @param {object} transactionData - Transaction data
   */
  async fillTransactionForm(transactionData) {
    if (transactionData.amount !== undefined) {
      await this.type(this.selectors.amountInput, String(transactionData.amount));
    }
    if (transactionData.currency) {
      await this.selectOption(this.selectors.currencySelect, transactionData.currency);
    }
    if (transactionData.type) {
      await this.selectOption(this.selectors.transactionTypeSelect, transactionData.type);
    }
    if (transactionData.status) {
      await this.selectOption(this.selectors.statusSelect, transactionData.status);
    }
    if (transactionData.date) {
      await this.type(this.selectors.dateInput, transactionData.date);
    }
    if (transactionData.description) {
      await this.type(this.selectors.descriptionInput, transactionData.description);
    }
    if (transactionData.comments) {
      await this.type(this.selectors.commentsInput, transactionData.comments);
    }
    if (transactionData.bankAccountId) {
      await this.selectOption(this.selectors.bankAccountSelect, transactionData.bankAccountId);
    }
    if (transactionData.categoryId) {
      await this.selectOption(this.selectors.categorySelect, transactionData.categoryId);
    }
    if (transactionData.subCategoryId) {
      await this.selectOption(this.selectors.subCategorySelect, transactionData.subCategoryId);
    }
    if (transactionData.paymentMethod) {
      await this.selectOption(this.selectors.paymentMethodSelect, transactionData.paymentMethod);
    }
  }

  /**
   * Submit transaction form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create transaction
   * @param {object} transactionData - Transaction data
   */
  async createTransaction(transactionData) {
    await this.fillTransactionForm(transactionData);
    await this.submitForm();
  }

  /**
   * Apply filters
   * @param {object} filters - Filter criteria
   */
  async applyFilters(filters) {
    if (filters.dateFrom) {
      await this.type(this.selectors.dateFromInput, filters.dateFrom);
    }
    if (filters.dateTo) {
      await this.type(this.selectors.dateToInput, filters.dateTo);
    }
    if (filters.type) {
      await this.selectOption(this.selectors.typeFilter, filters.type);
    }
    if (filters.status) {
      await this.selectOption(this.selectors.statusFilter, filters.status);
    }
    if (filters.bankAccountId) {
      await this.selectOption(this.selectors.bankAccountFilter, filters.bankAccountId);
    }
    if (filters.categoryId) {
      await this.selectOption(this.selectors.categoryFilter, filters.categoryId);
    }
    if (filters.search) {
      await this.type(this.selectors.searchInput, filters.search);
    }
    
    if (await this.isVisible(this.selectors.applyFilterButton)) {
      await this.click(this.selectors.applyFilterButton);
    }
  }

  /**
   * Clear filters
   */
  async clearFilters() {
    if (await this.isVisible(this.selectors.clearFilterButton)) {
      await this.click(this.selectors.clearFilterButton);
    }
  }

  /**
   * Get transaction count
   * @returns {Promise<number>}
   */
  async getTransactionCount() {
    const rows = this.page.locator(this.selectors.transactionRow);
    return await rows.count();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

