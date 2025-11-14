import { request } from '@playwright/test';
import dotenv from 'dotenv';
import { logger } from '../lib/logger.js';

dotenv.config();

/**
 * API Client for making HTTP requests
 */
export class ApiClient {
  constructor(baseURL = null) {
    this.baseURL = baseURL || process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3000/api';
    this.context = null;
    this.authToken = null;
  }

  /**
   * Initialize API context
   * @param {object} context - Playwright API request context
   */
  async init(context = null) {
    if (context) {
      this.context = context;
    } else {
      this.context = await request.newContext({
        baseURL: this.baseURL,
      });
    }
    logger.info(`API Client initialized with base URL: ${this.baseURL}`);
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
    logger.debug('Auth token set');
  }

  /**
   * Get headers with authentication
   * @param {object} customHeaders - Custom headers to add
   * @returns {object}
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @param {object} headers - Custom headers
   * @returns {Promise<object>}
   */
  async get(endpoint, params = {}, headers = {}) {
    try {
      if (!this.context) {
        await this.init();
      }

      const url = new URL(endpoint, this.baseURL);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      logger.info(`GET ${url.toString()}`);
      const response = await this.context.get(url.pathname + url.search, {
        headers: this.getHeaders(headers),
      });

      const data = await response.json();
      logger.debug(`Response status: ${response.status()}`);
      
      return {
        status: response.status(),
        data,
        headers: response.headers(),
      };
    } catch (error) {
      logger.error(`GET request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} headers - Custom headers
   * @returns {Promise<object>}
   */
  async post(endpoint, body = {}, headers = {}) {
    try {
      if (!this.context) {
        await this.init();
      }

      logger.info(`POST ${endpoint}`);
      logger.debug(`Request body: ${JSON.stringify(body)}`);

      const response = await this.context.post(endpoint, {
        headers: this.getHeaders(headers),
        data: body,
      });

      const data = await response.json().catch(() => ({}));
      logger.debug(`Response status: ${response.status()}`);
      
      return {
        status: response.status(),
        data,
        headers: response.headers(),
      };
    } catch (error) {
      logger.error(`POST request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} headers - Custom headers
   * @returns {Promise<object>}
   */
  async put(endpoint, body = {}, headers = {}) {
    try {
      if (!this.context) {
        await this.init();
      }

      logger.info(`PUT ${endpoint}`);
      logger.debug(`Request body: ${JSON.stringify(body)}`);

      const response = await this.context.put(endpoint, {
        headers: this.getHeaders(headers),
        data: body,
      });

      const data = await response.json().catch(() => ({}));
      logger.debug(`Response status: ${response.status()}`);
      
      return {
        status: response.status(),
        data,
        headers: response.headers(),
      };
    } catch (error) {
      logger.error(`PUT request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} headers - Custom headers
   * @returns {Promise<object>}
   */
  async delete(endpoint, headers = {}) {
    try {
      if (!this.context) {
        await this.init();
      }

      logger.info(`DELETE ${endpoint}`);

      const response = await this.context.delete(endpoint, {
        headers: this.getHeaders(headers),
      });

      const data = await response.json().catch(() => ({}));
      logger.debug(`Response status: ${response.status()}`);
      
      return {
        status: response.status(),
        data,
        headers: response.headers(),
      };
    } catch (error) {
      logger.error(`DELETE request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} headers - Custom headers
   * @returns {Promise<object>}
   */
  async patch(endpoint, body = {}, headers = {}) {
    try {
      if (!this.context) {
        await this.init();
      }

      logger.info(`PATCH ${endpoint}`);
      logger.debug(`Request body: ${JSON.stringify(body)}`);

      const response = await this.context.patch(endpoint, {
        headers: this.getHeaders(headers),
        data: body,
      });

      const data = await response.json().catch(() => ({}));
      logger.debug(`Response status: ${response.status()}`);
      
      return {
        status: response.status(),
        data,
        headers: response.headers(),
      };
    } catch (error) {
      logger.error(`PATCH request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and get auth token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<string>} - Auth token
   */
  async login(email, password) {
    try {
      const response = await this.post('/auth/sign-in/email', {
        email,
        password,
      });

      if (response.status === 200 && response.data?.token) {
        this.setAuthToken(response.data.token);
        return response.data.token;
      }

      throw new Error('Login failed: Invalid credentials');
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close API context
   */
  async close() {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
      logger.info('API context closed');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

