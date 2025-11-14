import { BasePage } from './BasePage.js';

/**
 * Categories Page Object Model
 * Contains all selectors and actions for categories pages
 */
export class CategoriesPage extends BasePage {
  constructor(page) {
    super(page);
    
    // XPath selectors
    this.selectors = {
      // List page
      pageTitle: '//h1[contains(text(), "Categor")] | //h2[contains(text(), "Categor")]',
      addCategoryButton: '//a[contains(@href, "/categories/add")] | //button[contains(text(), "Add Category")]',
      categoryCard: '//div[contains(@class, "category")] | //*[contains(@class, "card")]',
      categoryName: '//*[contains(@class, "category-name")] | //h3 | //h4',
      categoryType: '//*[contains(@class, "type")]',
      
      // Add/Edit form
      nameInput: '//input[@id="name"] | //input[@placeholder*="Name" or @placeholder*="Category Name"]',
      typeSelect: '//select[@id="type"] | //button[contains(@role, "combobox")][contains(., "Type")]',
      colorInput: '//input[@id="color"] | //input[@type="color"]',
      iconInput: '//input[@id="icon"] | //input[@placeholder*="Icon"]',
      submitButton: '//button[@type="submit"] | //button[contains(text(), "Add Category")] | //button[contains(text(), "Update")]',
      cancelButton: '//button[contains(text(), "Cancel")]',
      
      // Form errors
      nameError: '//input[@id="name"]/following-sibling::p[contains(@class, "text-red-500")]',
      typeError: '//select[@id="type"]/following-sibling::p[contains(@class, "text-red-500")]',
      
      // Actions
      editButton: '//button[contains(text(), "Edit")] | //a[contains(@href, "/edit")]',
      deleteButton: '//button[contains(text(), "Delete")]',
      
      // Subcategories
      addSubCategoryButton: '//button[contains(text(), "Add Sub Category")]',
      subCategoryNameInput: '//input[@id="subCategoryName"] | //input[@placeholder*="Sub Category"]',
      
      // Success message
      successToast: '//*[contains(@role, "status")] | //*[contains(text(), "successfully")]',
    };
  }

  /**
   * Navigate to categories list page
   */
  async navigateToCategories() {
    await this.navigate('/categories');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add category page
   */
  async navigateToAddCategory() {
    await this.navigate('/categories/add');
    await this.waitForPageLoad();
  }

  /**
   * Click Add Category button
   */
  async clickAddCategory() {
    await this.click(this.selectors.addCategoryButton);
  }

  /**
   * Fill category form
   * @param {object} categoryData - Category data
   */
  async fillCategoryForm(categoryData) {
    if (categoryData.name) {
      await this.type(this.selectors.nameInput, categoryData.name);
    }
    if (categoryData.type) {
      await this.selectOption(this.selectors.typeSelect, categoryData.type);
    }
    if (categoryData.color) {
      await this.type(this.selectors.colorInput, categoryData.color);
    }
    if (categoryData.icon) {
      await this.type(this.selectors.iconInput, categoryData.icon);
    }
  }

  /**
   * Submit category form
   */
  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Create category
   * @param {object} categoryData - Category data
   */
  async createCategory(categoryData) {
    await this.fillCategoryForm(categoryData);
    await this.submitForm();
  }

  /**
   * Verify category exists
   * @param {string} categoryName - Name of the category
   * @returns {Promise<boolean>}
   */
  async verifyCategoryExists(categoryName) {
    const categoryCard = this.page.locator(`//div[contains(., "${categoryName}")]`);
    return await categoryCard.isVisible();
  }

  /**
   * Click edit button for a category
   * @param {string} categoryName - Name of the category
   */
  async clickEditCategory(categoryName) {
    const categoryCard = this.page.locator(`//div[contains(., "${categoryName}")]`);
    await categoryCard.locator(this.selectors.editButton).click();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage() {
    await this.waitForElement(this.selectors.successToast, 5000);
  }
}

