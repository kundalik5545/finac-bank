import { BasePage } from './BasePage.js';

/**
 * Bank Account Page Object Model
 * Contains all selectors and actions for bank account pages
 */
export class BankAccountPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors - List page
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Bank Account")] | //h2[contains(text(), "Bank Account")]',
      addBankAccountButton: '//a[contains(@href, "/bank-account/add")] | //button[contains(text(), "Add Bank Account")]',
      bankAccountCard: '//div[contains(@class, "card")] | //*[contains(@class, "bank-account")]',
      bankAccountName: '//*[contains(@class, "bank-account-name")] | //h3 | //h4',
      bankAccountBalance: '//*[contains(@class, "balance")] | //*[contains(text(), "₹")] | //*[contains(text(), "$")]',
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      viewDetailsButton: '//button[contains(text(), "View")] | //a[contains(@href, "/details")]',
      
      // Add/Edit form
      nameInput: '//input[@id="name"] | //input[@placeholder*="bank name" or @placeholder*="Bank Name"]',
      accountNumberInput: '//input[@id="bankAccount"] | //input[@placeholder*="Account Number"]',
      ifscCodeInput: '//input[@id="ifscCode"] | //input[@placeholder*="IFSC"]',
      branchInput: '//input[@id="branch"] | //input[@placeholder*="Branch"]',
      balanceInput: '//input[@id="balance"] | //input[@type="number"][contains(@placeholder, "Balance")]',
      accountTypeSelect: '//select[@id="type"] | //button[contains(@role, "combobox")][contains(., "Select account type")]',
      currencySelect: '//select[@id="currency"] | //button[contains(@role, "combobox")][contains(., "Select currency")]',
      isActiveCheckbox: '//input[@id="isActive"] | //input[@type="checkbox"][@id="isActive"]',
      isPrimaryCheckbox: '//input[@id="isPrimary"] | //input[@type="checkbox"][@id="isPrimary"]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Bank Account")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      nameError: '//input[@id="name"]/following-sibling::p[contains(@class, "text-red-500")]',
      balanceError: '//input[@id="balance"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to bank account list page
   */
  async navigateToBankAccounts() {
    await this.navigate('/bank-account');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add bank account page
   */
  async navigateToAddBankAccount() {
    await this.navigate('/bank-account/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Bank Account button
   */
  async clickAddBankAccount() {
    await this.click(this.selectors.addBankAccountButton);
  }

  /**
   * Fill bank account form
   * @param {object} accountData - Bank account data
   */
  async fillBankAccountForm(accountData) {
    if (accountData.name) {
      await this.type(this.selectors.nameInput, accountData.name);
    }
    if (accountData.bankAccount) {
      await this.type(this.selectors.accountNumberInput, accountData.bankAccount);
    }
    if (accountData.ifscCode) {
      await this.type(this.selectors.ifscCodeInput, accountData.ifscCode);
    }
    if (accountData.branch) {
      await this.type(this.selectors.branchInput, accountData.branch);
    }
    if (accountData.balance !== undefined) {
      await this.type(this.selectors.balanceInput, String(accountData.balance));
    }
    if (accountData.type) {
      await this.selectOption(this.selectors.accountTypeSelect, accountData.type);
    }
    if (accountData.currency) {
      await this.selectOption(this.selectors.currencySelect, accountData.currency);
    }
    if (accountData.isActive !== undefined) {
      await this.setCheckbox(this.selectors.isActiveCheckbox, accountData.isActive);
    }
    if (accountData.isPrimary !== undefined) {
      await this.setCheckbox(this.selectors.isPrimaryCheckbox, accountData.isPrimary);
    }
  }

  /**
   * Submit bank account form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create bank account
   * @param {object} accountData - Bank account data
   */
  async createBankAccount(accountData) {
    await this.fillBankAccountForm(accountData);
    await this.submitForm();
  }

  /**
   * Click edit button for a bank account
   * @param {string} accountName - Name of the bank account
   */
  async clickEditAccount(accountName) {
    // Find the account card and click edit
    const accountCard = this.page.locator(`//div[contains(., "${accountName}")]`);
    await accountCard.locator(this.selectors.editButton).click();
  }

  /**
   * Click delete button for a bank account
   * @param {string} accountName - Name of the bank account
   */
  async clickDeleteAccount(accountName) {
    const accountCard = this.page.locator(`//div[contains(., "${accountName}")]`);
    await accountCard.locator(this.selectors.deleteButton).click();
  }

  /**
   * Get bank account balance
   * @param {string} accountName - Name of the bank account
   * @returns {Promise<string>}
   */
  async getAccountBalance(accountName) {
    const accountCard = this.page.locator(`//div[contains(., "${accountName}")]`);
    return await accountCard.locator(this.selectors.bankAccountBalance).textContent();
  }

  /**
   * Verify bank account exists
   * @param {string} accountName - Name of the bank account
   * @returns {Promise<boolean>}
   */
  async verifyAccountExists(accountName) {
    const accountCard = this.page.locator(`//div[contains(., "${accountName}")]`);
    return await accountCard.isVisible();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

