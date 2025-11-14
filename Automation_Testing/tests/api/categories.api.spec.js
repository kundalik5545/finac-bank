import { test, expect } from '@playwright/test';
import { ApiClient } from '../../helpers/apiClient.js';
import { TestDataHelper } from '../../fixtures/testData.js';
import { getTestUser } from '../../fixtures/testUser.js';

test.describe('Categories API Tests', () => {
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

  test('should get all categories', async () => {
    const response = await apiClient.get('/categories');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });

  test('should create category with valid data', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories[0];
    
    const response = await apiClient.post('/categories', category);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(category.name);
  });

  test('should fail to create category with invalid data', async () => {
    const categoriesData = TestDataHelper.getCategoriesData();
    const invalidCategory = categoriesData.invalidCategories[0];
    
    const response = await apiClient.post('/categories', invalidCategory);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should get category by ID', async () => {
    // First create a category
    const categoriesData = TestDataHelper.getCategoriesData();
    const category = categoriesData.validCategories[0];
    
    const createResponse = await apiClient.post('/categories', category);
    
    if (createResponse.status === 201 && createResponse.data.id) {
      const categoryId = createResponse.data.id;
      const response = await apiClient.get(`/categories/${categoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(categoryId);
    }
  });
});

