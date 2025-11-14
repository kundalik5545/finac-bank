import { test, expect } from '@playwright/test';
import { ApiClient } from '../../helpers/apiClient.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';
import { getCurrentMonth, getCurrentYear } from '../../lib/date.js';

test.describe('Budgets API Tests', () => {
  let apiClient;
  let authToken;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient();
    await apiClient.init(request);
    
    // Login to get auth token
    const user = getTestUser();
    try {
      authToken = await apiClient.login(user.email, user.password);
      apiClient.setAuthToken(authToken);
    } catch (error) {
      console.warn('Login failed, continuing without auth token');
    }
  });

  test.afterEach(async () => {
    await apiClient.close();
  });

  test('should get all budgets', async () => {
    const response = await apiClient.get('/budgets');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });

  test('should create budget with valid data', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const budget = budgetsData.validBudgets[0];
    budget.month = getCurrentMonth();
    budget.year = getCurrentYear();
    
    const response = await apiClient.post('/budgets', budget);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  test('should fail to create budget with invalid data', async () => {
    const budgetsData = TestDataHelper.getBudgetsData();
    const invalidBudget = budgetsData.invalidBudgets[0];
    
    const response = await apiClient.post('/budgets', invalidBudget);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

