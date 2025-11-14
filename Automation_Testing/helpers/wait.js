import { logger } from '../lib/logger.js';

/**
 * Custom wait utilities for Playwright
 */
export class WaitHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forElementVisible(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      logger.debug(`Element visible: ${selector}`);
    } catch (error) {
      logger.error(`Element not visible: ${selector} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forElementHidden(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { state: 'hidden', timeout });
      logger.debug(`Element hidden: ${selector}`);
    } catch (error) {
      logger.error(`Element not hidden: ${selector} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for element to be attached to DOM
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forElementAttached(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { state: 'attached', timeout });
      logger.debug(`Element attached: ${selector}`);
    } catch (error) {
      logger.error(`Element not attached: ${selector} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for network to be idle
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forNetworkIdle(timeout = 30000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      logger.debug('Network is idle');
    } catch (error) {
      logger.warn(`Network idle timeout: ${error.message}`);
    }
  }

  /**
   * Wait for specific HTTP response
   * @param {string|RegExp} url - URL pattern to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<object>}
   */
  async forResponse(url, timeout = 30000) {
    try {
      const response = await this.page.waitForResponse(
        response => {
          const responseUrl = response.url();
          if (typeof url === 'string') {
            return responseUrl.includes(url);
          }
          return url.test(responseUrl);
        },
        { timeout }
      );
      logger.debug(`Response received: ${response.url()}`);
      return response;
    } catch (error) {
      logger.error(`Response timeout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for specific HTTP request
   * @param {string|RegExp} url - URL pattern to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<object>}
   */
  async forRequest(url, timeout = 30000) {
    try {
      const request = await this.page.waitForRequest(
        request => {
          const requestUrl = request.url();
          if (typeof url === 'string') {
            return requestUrl.includes(url);
          }
          return url.test(requestUrl);
        },
        { timeout }
      );
      logger.debug(`Request sent: ${request.url()}`);
      return request;
    } catch (error) {
      logger.error(`Request timeout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for text to appear on page
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forText(text, timeout = 30000) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout });
      logger.debug(`Text appeared: ${text}`);
    } catch (error) {
      logger.error(`Text not found: ${text} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for URL to match pattern
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forURL(urlPattern, timeout = 30000) {
    try {
      await this.page.waitForURL(urlPattern, { timeout });
      logger.debug(`URL matched: ${urlPattern}`);
    } catch (error) {
      logger.error(`URL timeout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for function to return truthy value
   * @param {Function} fn - Function to execute
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<void>}
   */
  async forCondition(fn, timeout = 30000, interval = 1000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await fn();
        if (result) {
          logger.debug('Condition met');
          return;
        }
      } catch (error) {
        // Continue polling
      }
      
      await this.page.waitForTimeout(interval);
    }
    
    throw new Error(`Condition timeout after ${timeout}ms`);
  }

  /**
   * Wait for specified time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  async forTime(ms) {
    await this.page.waitForTimeout(ms);
    logger.debug(`Waited for ${ms}ms`);
  }

  /**
   * Wait for page to load completely
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async forPageLoad(timeout = 60000) {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      await this.page.waitForLoadState('networkidle', { timeout });
      logger.debug('Page loaded completely');
    } catch (error) {
      logger.warn(`Page load timeout: ${error.message}`);
    }
  }
}

