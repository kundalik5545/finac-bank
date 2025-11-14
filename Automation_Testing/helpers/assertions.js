import { expect } from '@playwright/test';
import { logger } from '../lib/logger.js';

/**
 * Custom assertion helpers
 */
export class AssertionHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Assert element is visible
   * @param {string} selector - Element selector
   * @param {string} message - Custom error message
   */
  async assertElementVisible(selector, message = `Element should be visible: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeVisible();
      logger.debug(`Assertion passed: Element visible - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element is hidden
   * @param {string} selector - Element selector
   * @param {string} message - Custom error message
   */
  async assertElementHidden(selector, message = `Element should be hidden: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeHidden();
      logger.debug(`Assertion passed: Element hidden - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element contains text
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text
   * @param {string} message - Custom error message
   */
  async assertTextContains(selector, expectedText, message = `Element should contain text: ${expectedText}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toContainText(expectedText);
      logger.debug(`Assertion passed: Text contains - ${expectedText}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element has exact text
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text
   * @param {string} message - Custom error message
   */
  async assertTextEquals(selector, expectedText, message = `Element text should equal: ${expectedText}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toHaveText(expectedText);
      logger.debug(`Assertion passed: Text equals - ${expectedText}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element has attribute
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @param {string} expectedValue - Expected attribute value
   * @param {string} message - Custom error message
   */
  async assertAttribute(selector, attribute, expectedValue, message = `Element should have attribute ${attribute} = ${expectedValue}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toHaveAttribute(attribute, expectedValue);
      logger.debug(`Assertion passed: Attribute - ${attribute} = ${expectedValue}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert URL contains text
   * @param {string} expectedText - Expected text in URL
   * @param {string} message - Custom error message
   */
  async assertURLContains(expectedText, message = `URL should contain: ${expectedText}`) {
    try {
      await expect(this.page).toHaveURL(new RegExp(expectedText));
      logger.debug(`Assertion passed: URL contains - ${expectedText}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert URL equals
   * @param {string} expectedURL - Expected URL
   * @param {string} message - Custom error message
   */
  async assertURLEquals(expectedURL, message = `URL should equal: ${expectedURL}`) {
    try {
      await expect(this.page).toHaveURL(expectedURL);
      logger.debug(`Assertion passed: URL equals - ${expectedURL}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert page title contains text
   * @param {string} expectedText - Expected text in title
   * @param {string} message - Custom error message
   */
  async assertTitleContains(expectedText, message = `Title should contain: ${expectedText}`) {
    try {
      await expect(this.page).toHaveTitle(new RegExp(expectedText));
      logger.debug(`Assertion passed: Title contains - ${expectedText}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element is enabled
   * @param {string} selector - Element selector
   * @param {string} message - Custom error message
   */
  async assertElementEnabled(selector, message = `Element should be enabled: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeEnabled();
      logger.debug(`Assertion passed: Element enabled - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element is disabled
   * @param {string} selector - Element selector
   * @param {string} message - Custom error message
   */
  async assertElementDisabled(selector, message = `Element should be disabled: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeDisabled();
      logger.debug(`Assertion passed: Element disabled - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert checkbox is checked
   * @param {string} selector - Checkbox selector
   * @param {string} message - Custom error message
   */
  async assertCheckboxChecked(selector, message = `Checkbox should be checked: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeChecked();
      logger.debug(`Assertion passed: Checkbox checked - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert checkbox is unchecked
   * @param {string} selector - Checkbox selector
   * @param {string} message - Custom error message
   */
  async assertCheckboxUnchecked(selector, message = `Checkbox should be unchecked: ${selector}`) {
    try {
      const element = this.page.locator(selector);
      await expect(element).not.toBeChecked();
      logger.debug(`Assertion passed: Checkbox unchecked - ${selector}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert element count
   * @param {string} selector - Element selector
   * @param {number} expectedCount - Expected count
   * @param {string} message - Custom error message
   */
  async assertElementCount(selector, expectedCount, message = `Element count should be ${expectedCount}`) {
    try {
      const elements = this.page.locator(selector);
      await expect(elements).toHaveCount(expectedCount);
      logger.debug(`Assertion passed: Element count - ${expectedCount}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert form validation error message
   * @param {string} fieldSelector - Form field selector
   * @param {string} expectedError - Expected error message
   * @param {string} message - Custom error message
   */
  async assertFormError(fieldSelector, expectedError, message = `Form should show error: ${expectedError}`) {
    try {
      // Look for error message near the field
      const errorSelector = `${fieldSelector} + .text-red-500, ${fieldSelector} ~ .text-red-500`;
      const errorElement = this.page.locator(errorSelector);
      await expect(errorElement).toContainText(expectedError);
      logger.debug(`Assertion passed: Form error - ${expectedError}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }

  /**
   * Assert toast notification appears
   * @param {string} expectedText - Expected toast text
   * @param {string} message - Custom error message
   */
  async assertToastMessage(expectedText, message = `Toast should show: ${expectedText}`) {
    try {
      const toastSelector = '[role="status"], .toast, [data-sonner-toast]';
      const toast = this.page.locator(toastSelector);
      await expect(toast).toContainText(expectedText, { timeout: 5000 });
      logger.debug(`Assertion passed: Toast message - ${expectedText}`);
    } catch (error) {
      logger.error(`Assertion failed: ${message}`);
      throw error;
    }
  }
}

