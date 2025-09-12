import { db } from '../db/database';

export interface Todo {
    id?: number;
    title: string;
    description: string;
    link: string;
    due_date: string; // ISO string
    is_completed: boolean;
}

export class TodoService {
  static async getAll(): Promise<Todo[]> {
    try {
      const rows = await db.all('SELECT * FROM todos ORDER BY due_date ASC');
      return rows as Todo[];
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Todo | undefined> {
    try {
      const row = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
      return row as Todo | undefined;
    } catch (error) {
      console.error('Error fetching todo by id:', error);
      throw error;
    }
  }

  static async create(todo: Omit<Todo, 'id'>): Promise<number> {
    try {
      const result = await db.run(
        `INSERT INTO todos (title, description, link, due_date, is_completed)
                 VALUES (?, ?, ?, ?, ?)`,
        [todo.title, todo.description, todo.link, todo.due_date, todo.is_completed ? 1 : 0],
      );
      return result.insertId!;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  static async update(id: number, todo: Partial<Omit<Todo, 'id'>>): Promise<void> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      if (todo.title !== undefined) {
        fields.push('title = ?');
        values.push(todo.title);
      }
      if (todo.description !== undefined) {
        fields.push('description = ?');
        values.push(todo.description);
      }
      if (todo.link !== undefined) {
        fields.push('link = ?');
        values.push(todo.link);
      }
      if (todo.due_date !== undefined) {
        fields.push('due_date = ?');
        values.push(todo.due_date);
      }
      if (todo.is_completed !== undefined) {
        fields.push('is_completed = ?');
        values.push(todo.is_completed ? 1 : 0);
      }
      if (fields.length === 0) {
        return;
      }
      values.push(id);

      await db.run(
        `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await db.run('DELETE FROM todos WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}

export default TodoService;
