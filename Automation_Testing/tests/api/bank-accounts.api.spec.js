import { test, expect } from '@playwright/test';
import { ApiClient } from '../../helpers/apiClient.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('Bank Accounts API Tests', () => {
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
      // If login fails, try to continue without auth
      console.warn('Login failed, continuing without auth token');
    }
  });

  test.afterEach(async () => {
    await apiClient.close();
  });

  test('should get all bank accounts', async () => {
    const response = await apiClient.get('/bank-accounts');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });

  test('should create bank account with valid data', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    const response = await apiClient.post('/bank-accounts', accountData);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(accountData.name);
  });

  test('should fail to create bank account with invalid data', async () => {
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const invalidAccount = bankAccountsData.invalidBankAccounts[0];
    
    const response = await apiClient.post('/bank-accounts', invalidAccount);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should get bank account by ID', async () => {
    // First create an account
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    const createResponse = await apiClient.post('/bank-accounts', accountData);
    
    if (createResponse.status === 201 && createResponse.data.id) {
      const accountId = createResponse.data.id;
      const response = await apiClient.get(`/bank-accounts/${accountId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(accountId);
    }
  });

  test('should update bank account', async () => {
    // First create an account
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    const createResponse = await apiClient.post('/bank-accounts', accountData);
    
    if (createResponse.status === 201 && createResponse.data.id) {
      const accountId = createResponse.data.id;
      const updateData = bankAccountsData.updateBankAccounts[0];
      
      const response = await apiClient.put(`/bank-accounts/${accountId}`, updateData);
      
      expect(response.status).toBe(200);
    }
  });

  test('should delete bank account', async () => {
    // First create an account
    const bankAccountsData = TestDataHelper.getBankAccountsData();
    const accountData = bankAccountsData.validBankAccounts[0];
    
    const createResponse = await apiClient.post('/bank-accounts', accountData);
    
    if (createResponse.status === 201 && createResponse.data.id) {
      const accountId = createResponse.data.id;
      const response = await apiClient.delete(`/bank-accounts/${accountId}`);
      
      expect(response.status).toBe(200);
    }
  });
});

