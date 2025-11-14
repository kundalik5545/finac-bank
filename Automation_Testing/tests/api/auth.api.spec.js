import { test, expect } from '@playwright/test';
import { ApiClient } from '../../helpers/apiClient.js';
import { TestDataHelper } from '../../fixtures/testData.js';

test.describe('Auth API Tests', () => {
  let apiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient();
    await apiClient.init(request);
  });

  test.afterEach(async () => {
    await apiClient.close();
  });

  test('should login successfully with valid credentials', async () => {
    const usersData = TestDataHelper.getUsersData();
    const user = usersData.validUsers[0];
    
    const response = await apiClient.post('/auth/sign-in/email', {
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('user');
  });

  test('should fail login with invalid credentials', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.invalidUsers[0];
    
    const response = await apiClient.post('/auth/sign-in/email', {
      email: invalidUser.email,
      password: invalidUser.password,
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should sign up successfully with valid data', async () => {
    const usersData = TestDataHelper.getUsersData();
    const signUpUser = usersData.signUpUsers[0];
    const uniqueEmail = `test_${Date.now()}@example.com`;
    
    const response = await apiClient.post('/auth/sign-up/email', {
      email: uniqueEmail,
      password: signUpUser.password,
      name: signUpUser.name,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('user');
  });

  test('should fail sign up with invalid email', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.email === 'invalid-email');
    
    if (invalidUser) {
      const response = await apiClient.post('/auth/sign-up/email', {
        email: invalidUser.email,
        password: invalidUser.password,
        name: invalidUser.name,
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('should fail sign up with weak password', async () => {
    const usersData = TestDataHelper.getUsersData();
    const invalidUser = usersData.signUpInvalidUsers.find(u => u.password === 'short');
    
    if (invalidUser) {
      const response = await apiClient.post('/auth/sign-up/email', {
        email: `test_${Date.now()}@example.com`,
        password: invalidUser.password,
        name: invalidUser.name,
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });
});

