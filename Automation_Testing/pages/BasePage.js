import { expect } from "@playwright/test";
import { logger } from "../lib/logger.js";

/**
 * BasePage class containing common methods for all page objects
 */
export class BasePage {
  constructor(page) {
    this.page = page;
    this.logger = logger;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to
   */
  async navigate(url = "") {
    try {
      const fullUrl = url.startsWith("http")
        ? url
        : `${this.page.url().split("/").slice(0, 3).join("/")}${url}`;
      await this.page.goto(fullUrl, { waitUntil: "networkidle" });
      this.logger.info(`Navigated to: ${fullUrl}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector (XPath or CSS)
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Locator>}
   */
  async waitForElement(selector, timeout = 30000) {
    try {
      const locator =
        selector.startsWith("//") || selector.startsWith("(//")
          ? this.page.locator(selector)
          : this.page.locator(selector);

      await locator.waitFor({ state: "visible", timeout });
      this.logger.debug(`Element found: ${selector}`);
      return locator;
    } catch (error) {
      this.logger.error(`Element not found: ${selector} - ${error.message}`);
      await this.takeScreenshot(
        `element_not_found_${selector.replace(/[^a-zA-Z0-9]/g, "_")}`
      );
      throw error;
    }
  }

  /**
   * Click on an element
   * @param {string} selector - Element selector
   * @param {object} options - Click options
   */
  async click(selector, options = {}) {
    try {
      const element = await this.waitForElement(selector);
      await element.click(options);
      this.logger.debug(`Clicked on: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click on ${selector}: ${error.message}`);
      await this.takeScreenshot(
        `click_failed_${selector.replace(/[^a-zA-Z0-9]/g, "_")}`
      );
      throw error;
    }
  }

  /**
   * Type text into an input field
   * @param {string} selector - Input selector
   * @param {string} text - Text to type
   * @param {object} options - Type options
   */
  async type(selector, text, options = {}) {
    try {
      const element = await this.waitForElement(selector);
      await element.clear();
      await element.fill(text, options);
      this.logger.debug(`Typed text into: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to type into ${selector}: ${error.message}`);
      await this.takeScreenshot(
        `type_failed_${selector.replace(/[^a-zA-Z0-9]/g, "_")}`
      );
      throw error;
    }
  }

  /**
   * Get text content from an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>}
   */
  async getText(selector) {
    try {
      const element = await this.waitForElement(selector);
      const text = await element.textContent();
      this.logger.debug(`Got text from ${selector}: ${text}`);
      return text?.trim() || "";
    } catch (error) {
      this.logger.error(
        `Failed to get text from ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Get attribute value from an element
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @returns {Promise<string|null>}
   */
  async getAttribute(selector, attribute) {
    try {
      const element = await this.waitForElement(selector);
      const value = await element.getAttribute(attribute);
      return value;
    } catch (error) {
      this.logger.error(
        `Failed to get attribute ${attribute} from ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    try {
      const locator = this.page.locator(selector);
      return await locator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to be hidden
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementHidden(selector, timeout = 30000) {
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: "hidden", timeout });
      this.logger.debug(`Element hidden: ${selector}`);
    } catch (error) {
      this.logger.error(`Element not hidden: ${selector} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string} value - Option value to select
   */
  async selectOption(selector, value) {
    try {
      const element = await this.waitForElement(selector);
      await element.selectOption(value);
      this.logger.debug(`Selected option ${value} from ${selector}`);
    } catch (error) {
      this.logger.error(
        `Failed to select option from ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Check or uncheck a checkbox
   * @param {string} selector - Checkbox selector
   * @param {boolean} checked - Checked state
   */
  async setCheckbox(selector, checked = true) {
    try {
      const element = await this.waitForElement(selector);
      const currentState = await element.isChecked();
      if (currentState !== checked) {
        await element.click();
      }
      this.logger.debug(`Set checkbox ${selector} to ${checked}`);
    } catch (error) {
      this.logger.error(`Failed to set checkbox ${selector}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fill a form with data
   * @param {object} formData - Object with selector-value pairs
   */
  async fillForm(formData) {
    try {
      for (const [selector, value] of Object.entries(formData)) {
        if (value !== null && value !== undefined) {
          await this.type(selector, String(value));
        }
      }
      this.logger.debug("Form filled successfully");
    } catch (error) {
      this.logger.error(`Failed to fill form: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit a form
   * @param {string} selector - Form selector
   */
  async submitForm(selector) {
    try {
      const form = await this.waitForElement(selector);
      await form.press("Enter");
      this.logger.debug(`Form submitted: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to submit form ${selector}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const screenshotPath = `screenshots/${name}_${timestamp}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      this.logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Wait for network to be idle
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForNetworkIdle(timeout = 30000) {
    try {
      await this.page.waitForLoadState("networkidle", { timeout });
      this.logger.debug("Network is idle");
    } catch (error) {
      this.logger.warn(`Network idle timeout: ${error.message}`);
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState("domcontentloaded");
      await this.page.waitForLoadState("networkidle");
      this.logger.debug("Page loaded completely");
    } catch (error) {
      this.logger.warn(`Page load timeout: ${error.message}`);
    }
  }

  /**
   * Get current URL
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Reload the page
   */
  async reload() {
    try {
      await this.page.reload({ waitUntil: "networkidle" });
      this.logger.debug("Page reloaded");
    } catch (error) {
      this.logger.error(`Failed to reload page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    try {
      await this.page.goBack({ waitUntil: "networkidle" });
      this.logger.debug("Navigated back");
    } catch (error) {
      this.logger.error(`Failed to go back: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for a specific text to appear on the page
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForText(text, timeout = 30000) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout });
      this.logger.debug(`Text appeared: ${text}`);
    } catch (error) {
      this.logger.error(`Text not found: ${text} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify element contains text
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text
   */
  async verifyText(selector, expectedText) {
    try {
      const actualText = await this.getText(selector);
      expect(actualText).toContain(expectedText);
      this.logger.debug(`Verified text in ${selector}: ${expectedText}`);
    } catch (error) {
      this.logger.error(`Text verification failed: ${error.message}`);
      throw error;
    }
  }
}
