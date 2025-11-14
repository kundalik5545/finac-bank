import { test, expect } from '@playwright/test';
import { ApiClient } from '../../helpers/apiClient.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';
import { formatDate } from '../../lib/date.js';

test.describe('Transactions API Tests', () => {
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

  test('should get all transactions', async () => {
    const response = await apiClient.get('/transactions');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.transactions) || Array.isArray(response.data)).toBeTruthy();
  });

  test('should create transaction with valid data', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const transaction = transactionsData.validTransactions[0];
    transaction.date = formatDate(new Date());
    
    const response = await apiClient.post('/transactions', transaction);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  test('should fail to create transaction with invalid data', async () => {
    const transactionsData = TestDataHelper.getTransactionsData();
    const invalidTransaction = transactionsData.invalidTransactions[0];
    
    const response = await apiClient.post('/transactions', invalidTransaction);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should filter transactions by type', async () => {
    const response = await apiClient.get('/transactions', { type: 'INCOME' });
    
    expect(response.status).toBe(200);
  });

  test('should filter transactions by status', async () => {
    const response = await apiClient.get('/transactions', { status: 'COMPLETED' });
    
    expect(response.status).toBe(200);
  });

  test('should filter transactions by date range', async () => {
    const dateFrom = formatDate(new Date(new Date().setDate(1)));
    const dateTo = formatDate(new Date());
    
    const response = await apiClient.get('/transactions', { dateFrom, dateTo });
    
    expect(response.status).toBe(200);
  });
});

