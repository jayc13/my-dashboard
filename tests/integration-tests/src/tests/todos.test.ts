import { TestHelpers } from '@utils/test-helpers';

describe('To-Do List API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();
  });

  describe('GET /api/to_do_list', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      await expect(httpClient.getJson('/api/to_do_list')).rejects.toThrow('HTTP 401');
    });

    it('should return todos list', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/to_do_list', {
        'x-api-key': apiKey
      });

      expect(Array.isArray(response)).toBe(true);
    });

    it('should return todos with correct structure', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      const response = await httpClient.getJson('/api/to_do_list', {
        'x-api-key': apiKey
      });
      
      if (response.length > 0) {
        const todo = response[0];
        testHelpers.validateResponseStructure(todo, ['id', 'title']);
        expect(typeof todo.id).toBe('number');
        expect(typeof todo.title).toBe('string');
      }
    });
  });

  describe('POST /api/to_do_list', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      const newTodo = {
        title: 'Test Todo',
        description: 'Test description',
        is_completed: false
      };

      await expect(httpClient.postJson('/api/to_do_list', newTodo)).rejects.toThrow('HTTP 401');
    });

    it('should create a new todo', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);

      const newTodo = {
        title: `Test Todo ${randomString}`,
        description: `Test description for todo ${randomString}`,
        is_completed: false
      };
      
      const response = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });
      
      testHelpers.validateResponseStructure(response, ['id']);
      expect(typeof response.id).toBe('number');
      expect(response.id).toBeGreaterThan(0);
    });

    it('should reject todo creation without title', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      const invalidTodo = {
        description: 'Test description without title',
        is_completed: false
      };
      
      await expect(httpClient.postJson('/api/to_do_list', invalidTodo, {
        'x-api-key': apiKey
      })).rejects.toThrow('HTTP 400');
    });

    it('should create todo with optional fields', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      
      const newTodo = {
        title: `Test Todo with Link ${randomString}`,
        description: `Test description ${randomString}`,
        link: 'https://example.com/test',
        due_date: '2024-12-31',
        is_completed: true
      };
      
      const response = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });
      
      testHelpers.validateResponseStructure(response, ['id']);
      expect(typeof response.id).toBe('number');
      expect(response.id).toBeGreaterThan(0);
    });
  });

  describe('GET /api/to_do_list/:id', () => {
    let createdTodoId: number;

    beforeAll(async () => {
      // Create a test todo for these tests
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      
      const newTodo = {
        title: `Test Todo for ID Tests ${randomString}`,
        description: `Test description ${randomString}`,
        is_completed: false
      };
      
      const response = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });
      
      createdTodoId = response.id;
    });

    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      await expect(httpClient.getJson(`/api/to_do_list/${createdTodoId}`)).rejects.toThrow('HTTP 401');
    });

    it('should return todo by ID', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson(`/api/to_do_list/${createdTodoId}`, {
        'x-api-key': apiKey
      });

      testHelpers.validateResponseStructure(response, ['id', 'title']);
      expect(response.id).toBe(createdTodoId);
    });

    it('should return 404 for non-existent todo', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentId = 999999;
      
      await expect(httpClient.getJson(`/api/to_do_list/${nonExistentId}`, {
        'x-api-key': apiKey
      })).rejects.toThrow('HTTP 404');
    });
  });

  describe('PUT /api/to_do_list/:id', () => {
    let createdTodoId: number;

    beforeAll(async () => {
      // Create a test todo for these tests
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      
      const newTodo = {
        title: `Test Todo for Update Tests ${randomString}`,
        description: `Test description ${randomString}`,
        is_completed: false
      };
      
      const response = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });
      
      createdTodoId = response.id;
    });

    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      const updatedTodo = {
        title: 'Updated Todo Title',
        description: 'Updated description',
        is_completed: true
      };

      const response = await httpClient.put(`/api/to_do_list/${createdTodoId}`, updatedTodo);

      expect(response.status).toBe(401);
    });

    it('should update todo', async () => {
      const httpClient = testHelpers.getHttpClient();

      const updatedTodo = {
        title: 'Updated Todo Title',
        description: 'Updated description',
        is_completed: true
      };

      const response = await httpClient.put(`/api/to_do_list/${createdTodoId}`, updatedTodo, {
        'x-api-key': apiKey
      });

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent todo update', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentId = 999999;
      
      const updatedTodo = {
        title: 'Updated Title',
        is_completed: true
      };
      
      const response = await httpClient.put(`/api/to_do_list/${nonExistentId}`, updatedTodo, {
        'x-api-key': apiKey
      });

      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('ToDo item not found')
    });
  });

  describe('DELETE /api/to_do_list/:id', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);

      // Create a todo to delete
      const newTodo = {
        title: `Test Todo for Delete ${randomString}`,
        description: `Test description ${randomString}`,
        is_completed: false
      };

      const createResponse = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });

      const todoId = createResponse.id;

      await httpClient.delete(`/api/to_do_list/${todoId}`);
    });

    it('should delete todo', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);

      // Create a todo to delete
      const newTodo = {
        title: `Test Todo for Delete ${randomString}`,
        description: `Test description ${randomString}`,
        is_completed: false
      };

      const createResponse = await httpClient.postJson('/api/to_do_list', newTodo, {
        'x-api-key': apiKey
      });

      const todoId = createResponse.id;

      // Delete the todo
      const deleteResponse = await httpClient.delete(`/api/to_do_list/${todoId}`, {
        'x-api-key': apiKey
      });

      expect(deleteResponse.status).toBe(204);
    });
  });
});
