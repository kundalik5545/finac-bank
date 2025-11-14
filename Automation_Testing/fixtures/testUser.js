import dotenv from 'dotenv';

dotenv.config();

/**
 * Test user credentials and helpers
 */
export const testUser = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'Test123!',
  name: process.env.TEST_USER_NAME || 'Test User',
};

/**
 * Get test user credentials
 * @returns {object}
 */
export function getTestUser() {
  return {
    email: testUser.email,
    password: testUser.password,
    name: testUser.name,
  };
}

/**
 * Generate unique test user email
 * @returns {string}
 */
export function generateUniqueEmail() {
  const timestamp = Date.now();
  return `test_${timestamp}@example.com`;
}

/**
 * Get invalid test user credentials
 * @returns {object}
 */
export function getInvalidTestUser() {
  return {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  };
}

