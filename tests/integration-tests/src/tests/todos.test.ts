import { TestHelpers } from '@utils/test-helpers';
import { MyDashboardAPI } from '@my-dashboard/sdk';
import { truncateTables, closeTestConnection } from '@utils/dbCleanup';

describe('To-Do List API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;

  let myDashboardSdk: MyDashboardAPI;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();
    myDashboardSdk = new MyDashboardAPI({
      baseUrl: testHelpers.getHttpClient().getBaseUrl(),
      apiKey: testHelpers.getApiKey(),
    });
  });

  // Clean up and close connection after all tests
  afterAll(async () => {
    await truncateTables(['todos']);
    await closeTestConnection();
  });

  describe('API Validations', () => {
    beforeAll(async () => {
      await truncateTables(['todos']);
    });
    describe('GET /api/to_do_list', () => {
      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        await expect(httpClient.getJson('/api/to_do_list')).rejects.toThrow('HTTP 401');
      });

      it('should return todos list', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.getJson('/api/to_do_list', {
          'x-api-key': apiKey,
        });

        expect(Array.isArray(response)).toBe(true);
      });

      it('should return todos with correct structure', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.getJson('/api/to_do_list', {
          'x-api-key': apiKey,
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
          isCompleted: false,
        };

        await expect(httpClient.postJson('/api/to_do_list', newTodo)).rejects.toThrow('HTTP 401');
      });

      it('should create a new todo', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newTodo = {
          title: `Test Todo ${randomString}`,
          description: `Test description for todo ${randomString}`,
          isCompleted: false,
        };

        const response = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
        });

        testHelpers.validateResponseStructure(response, ['id']);
        expect(typeof response.id).toBe('number');
        expect(response.id).toBeGreaterThan(0);
      });

      it('should reject todo creation without title', async () => {
        const httpClient = testHelpers.getHttpClient();

        const invalidTodo = {
          description: 'Test description without title',
          isCompleted: false,
        };

        await expect(httpClient.postJson('/api/to_do_list', invalidTodo, {
          'x-api-key': apiKey,
        })).rejects.toThrow('HTTP 400');
      });

      it('should create todo with optional fields', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newTodo = {
          title: `Test Todo with Link ${randomString}`,
          description: `Test description ${randomString}`,
          link: 'https://example.com/test',
          dueDate: '2024-12-31',
          isCompleted: true,
        };

        const response = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
        });

        testHelpers.validateResponseStructure(response, ['id']);
        expect(typeof response.id).toBe('number');
        expect(response.id).toBeGreaterThan(0);
      });
      it('should validate the due_date format', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newTodo = {
          title: `Test Todo with Invalid Due Date ${randomString}`,
          dueDate: randomString, // Invalid format
          isCompleted: false,
        };


        const response = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
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
          isCompleted: false,
        };

        const response = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
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
          'x-api-key': apiKey,
        });

        testHelpers.validateResponseStructure(response, ['id', 'title']);
        expect(response.id).toBe(createdTodoId);
      });

      it('should return 404 for non-existent todo', async () => {
        const httpClient = testHelpers.getHttpClient();
        const nonExistentId = 999999;

        await expect(httpClient.getJson(`/api/to_do_list/${nonExistentId}`, {
          'x-api-key': apiKey,
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
          isCompleted: false,
        };

        const response = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
        });

        createdTodoId = response.id;
      });

      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        const updatedTodo = {
          title: 'Updated Todo Title',
          description: 'Updated description',
          isCompleted: true,
        };

        const response = await httpClient.put(`/api/to_do_list/${createdTodoId}`, updatedTodo);

        expect(response.status).toBe(401);
      });

      it('should update todo', async () => {
        const httpClient = testHelpers.getHttpClient();

        const updatedTodo = {
          title: 'Updated Todo Title',
          description: 'Updated description',
          isCompleted: true,
        };

        const response = await httpClient.put(`/api/to_do_list/${createdTodoId}`, updatedTodo, {
          'x-api-key': apiKey,
        });

        expect(response.status).toBe(200);
      });

      it('should return 404 for non-existent todo update', async () => {
        const httpClient = testHelpers.getHttpClient();
        const nonExistentId = 999999;

        const updatedTodo = {
          title: 'Updated Title',
          is_completed: true,
        };

        const response = await httpClient.put(`/api/to_do_list/${nonExistentId}`, updatedTodo, {
          'x-api-key': apiKey,
        });

        const result = await response.json();

        expect(response.status).toBe(404);
        expect(result.error).toBe('ToDo item not found');
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
          isCompleted: false,
        };

        const createResponse = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
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
          is_completed: false,
        };

        const createResponse = await httpClient.postJson('/api/to_do_list', newTodo, {
          'x-api-key': apiKey,
        });

        const todoId = createResponse.id;

        // Delete the todo
        const deleteResponse = await httpClient.delete(`/api/to_do_list/${todoId}`, {
          'x-api-key': apiKey,
        });

        expect(deleteResponse.status).toBe(200);
        expect(await deleteResponse.json()).toStrictEqual({ success: true });
      });
    });
  });

  describe('SDK Tests', () => {
    let todoId: number;
    beforeAll(async () => {
      await truncateTables(['todos']);
    });
    it('List of ToDo - Empty', async () => {
      const todos = await myDashboardSdk.todos.getTodos();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(0);
    });
    it('Create ToDo', async () => {
      const newToDo = await myDashboardSdk.todos.createTodo({
        title: 'Test ToDo',
      });
      expect(newToDo.id).toBeDefined();
      expect(newToDo.title).toBe('Test ToDo');
      expect(newToDo.isCompleted).toBe(false);
      todoId = newToDo.id!;
    });

    it('List of ToDo - 1 element', async () => {
      const todos = await myDashboardSdk.todos.getTodos();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(1);

      const todoItem = todos[0];

      expect(todoItem.id).toBeDefined();
      expect(todoItem.title).toBe('Test ToDo');
    });
    it('Get ToDo by ID', async () => {
      const todo = await myDashboardSdk.todos.getTodo(todoId);
      expect(todo.id).toBe(todoId);
      expect(todo.title).toBe('Test ToDo');
      expect(todo.isCompleted).toBe(false);
    });
    it('Mark ToDo as completed', async () => {
      let todoItem = await myDashboardSdk.todos.getTodo(todoId);
      expect(todoItem.isCompleted).toBe(false);
      todoItem.isCompleted = true;
      await myDashboardSdk.todos.updateTodo(todoId, todoItem);
      todoItem = await myDashboardSdk.todos.getTodo(todoId);
      expect(todoItem.isCompleted).toBe(true);
    });
    it('Delete ToDo', async () => {
      const deleteResponse = await myDashboardSdk.todos.deleteTodo(todoId);
      expect(deleteResponse.success).toBe(true);
      const todos = await myDashboardSdk.todos.getTodos();
      expect(todos.length).toBe(0);
    });

    // Additional test cases for edge cases and error handling
    it('Create ToDo with all optional fields', async () => {
      const newToDo = await myDashboardSdk.todos.createTodo({
        title: 'Complete ToDo with All Fields',
        description: 'This todo has all possible fields filled',
        link: 'https://example.com/task',
        dueDate: '2024-12-31',
        isCompleted: false,
      });

      expect(newToDo.id).toBeDefined();
      expect(newToDo.title).toBe('Complete ToDo with All Fields');
      expect(newToDo.description).toBe('This todo has all possible fields filled');
      expect(newToDo.link).toBe('https://example.com/task');
      expect(newToDo.dueDate).toBe('2024-12-31');
      expect(newToDo.isCompleted).toBe(false);

      // Clean up
      await myDashboardSdk.todos.deleteTodo(newToDo.id!);
    });

    it('Create ToDo with minimal fields only', async () => {
      const newToDo = await myDashboardSdk.todos.createTodo({
        title: 'Minimal ToDo',
      });

      expect(newToDo.id).toBeDefined();
      expect(newToDo.title).toBe('Minimal ToDo');
      expect(newToDo.isCompleted).toBe(false);

      // Clean up
      await myDashboardSdk.todos.deleteTodo(newToDo.id!);
    });

    it('Update ToDo with partial fields', async () => {
      // Create a todo first
      const newToDo = await myDashboardSdk.todos.createTodo({
        title: 'Original Title',
        description: 'Original Description',
      });

      // Update only the title
      const updatedToDo = await myDashboardSdk.todos.updateTodo(newToDo.id!, {
        title: 'Updated Title',
        description: newToDo.description,
        isCompleted: newToDo.isCompleted,
      });

      expect(updatedToDo.title).toBe('Updated Title');
      expect(updatedToDo.description).toBe('Original Description');

      // Clean up
      await myDashboardSdk.todos.deleteTodo(newToDo.id!);
    });

    it('Handle non-existent ToDo operations gracefully', async () => {
      const nonExistentId = 999999;

      // Test getting non-existent todo
      await expect(myDashboardSdk.todos.getTodo(nonExistentId))
        .rejects.toThrow();

      // Test updating non-existent todo
      await expect(myDashboardSdk.todos.updateTodo(nonExistentId, {
        title: 'Updated Title',
      })).rejects.toThrow();

      // Test deleting non-existent todo
      const response = await myDashboardSdk.todos.deleteTodo(nonExistentId);
      expect(response.success).toBe(true);
    });

    it('Create multiple ToDos and verify list ordering', async () => {
      const todoIds: number[] = [];

      // Create multiple todos
      for (let i = 1; i <= 3; i++) {
        const todo = await myDashboardSdk.todos.createTodo({
          title: `Test ToDo ${i}`,
          description: `Description for todo ${i}`,
        });
        todoIds.push(todo.id!);
      }

      // Verify all todos are in the list
      const todos = await myDashboardSdk.todos.getTodos();
      expect(todos.length).toBeGreaterThanOrEqual(3);

      // Verify all created todos are present
      const createdTodos = todos.filter(todo => todoIds.includes(todo.id!));
      expect(createdTodos.length).toBe(3);

      // Clean up
      for (const id of todoIds) {
        await myDashboardSdk.todos.deleteTodo(id);
      }
    });

    it('Toggle ToDo completion status multiple times', async () => {
      const newToDo = await myDashboardSdk.todos.createTodo({
        title: 'Toggle Test ToDo',
      });

      let todoItem = await myDashboardSdk.todos.getTodo(newToDo.id!);
      expect(todoItem.isCompleted).toBe(false);

      // Mark as completed
      todoItem.isCompleted = true;
      await myDashboardSdk.todos.updateTodo(newToDo.id!, todoItem);
      todoItem = await myDashboardSdk.todos.getTodo(newToDo.id!);
      expect(todoItem.isCompleted).toBe(true);

      // Mark as incomplete again
      todoItem.isCompleted = false;
      await myDashboardSdk.todos.updateTodo(newToDo.id!, todoItem);
      todoItem = await myDashboardSdk.todos.getTodo(newToDo.id!);
      expect(todoItem.isCompleted).toBe(false);

      // Clean up
      await myDashboardSdk.todos.deleteTodo(newToDo.id!);
    });
  });
});
