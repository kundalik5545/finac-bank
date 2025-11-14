import { BasePage } from './BasePage.js';

/**
 * Assets Page Object Model
 * Contains all selectors and actions for assets pages
 */
export class AssetsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Asset")] | //h2[contains(text(), "Asset")]',
      addAssetButton: '//a[contains(@href, "/assets/add")] | //button[contains(text(), "Add Asset")]',
      assetCard: '//div[contains(@class, "asset")] | //*[contains(@class, "card")]',
      assetName: '//*[contains(@class, "asset-name")] | //h3 | //h4',
      assetType: '//*[contains(@class, "type")]',
      assetValue: '//*[contains(@class, "value")]',
      
      // Add/Edit form
      nameInput: '//input[@id="name"] | //input[@placeholder*="Name" or @placeholder*="Asset Name"]',
      typeSelect: '//select[@id="type"] | //button[contains(@role, "combobox")][contains(., "Type")]',
      currentValueInput: '//input[@id="currentValue"] | //input[@type="number"][contains(@placeholder, "Current Value")]',
      purchaseValueInput: '//input[@id="purchaseValue"] | //input[@type="number"][contains(@placeholder, "Purchase Value")]',
      purchaseDateInput: '//input[@id="purchaseDate"] | //input[@type="date"]',
      descriptionInput: '//input[@id="description"] | //textarea[@id="description"]',
      notesInput: '//input[@id="notes"] | //textarea[@id="notes"]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Asset")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      nameError: '//input[@id="name"]/following-sibling::p[contains(@class, "text-red-500")]',
      currentValueError: '//input[@id="currentValue"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Actions
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      viewDetailsButton: '//button[contains(text(), "View")] | //a[contains(@href, "/details")]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to assets list page
   */
  async navigateToAssets() {
    await this.navigate('/assets');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add asset page
   */
  async navigateToAddAsset() {
    await this.navigate('/assets/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Asset button
   */
  async clickAddAsset() {
    await this.click(this.selectors.addAssetButton);
  }

  /**
   * Fill asset form
   * @param {object} assetData - Asset data
   */
  async fillAssetForm(assetData) {
    if (assetData.name) {
      await this.type(this.selectors.nameInput, assetData.name);
    }
    if (assetData.type) {
      await this.selectOption(this.selectors.typeSelect, assetData.type);
    }
    if (assetData.currentValue !== undefined) {
      await this.type(this.selectors.currentValueInput, String(assetData.currentValue));
    }
    if (assetData.purchaseValue !== undefined) {
      await this.type(this.selectors.purchaseValueInput, String(assetData.purchaseValue));
    }
    if (assetData.purchaseDate) {
      await this.type(this.selectors.purchaseDateInput, assetData.purchaseDate);
    }
    if (assetData.description) {
      await this.type(this.selectors.descriptionInput, assetData.description);
    }
    if (assetData.notes) {
      await this.type(this.selectors.notesInput, assetData.notes);
    }
  }

  /**
   * Submit asset form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create asset
   * @param {object} assetData - Asset data
   */
  async createAsset(assetData) {
    await this.fillAssetForm(assetData);
    await this.submitForm();
  }

  /**
   * Verify asset exists
   * @param {string} assetName - Name of the asset
   * @returns {Promise<boolean>}
   */
  async verifyAssetExists(assetName) {
    const assetCard = this.page.locator(`//div[contains(., "${assetName}")]`);
    return await assetCard.isVisible();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

