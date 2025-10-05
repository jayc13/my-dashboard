import { Logger } from '../utils/logger';
import { DatabaseRow, db } from '../db/database';
import type { ToDoItem, ToDoItemInput } from '@my-dashboard/types/todos';

export class TodoService {
  private static formatTodoItem(todo: DatabaseRow): ToDoItem {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      link: todo.link,
      dueDate: todo.due_date,
      isCompleted: todo.is_completed === 1,
    };
  }

  static async getAll(): Promise<ToDoItem[]> {
    try {
      const rows = await db.all('SELECT * FROM todos ORDER BY due_date ASC');
      return rows.map(this.formatTodoItem);
    } catch (error) {
      Logger.error('Error fetching todos:', { error });
      throw error;
    }
  }

  static async getById(id: number): Promise<ToDoItem | undefined> {
    try {
      const row = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
      if (!row) {
        return undefined;
      }
      return this.formatTodoItem(row);
    } catch (error) {
      Logger.error('Error fetching todo by id:', { error });
      throw error;
    }
  }

  static async create(todo: ToDoItemInput): Promise<ToDoItem | undefined> {
    const {
      title,
      description = null,
      link = null,
      dueDate = null,
      isCompleted = false,
    } = todo;
    try {
      const result = await db.run(
        `INSERT INTO todos (title, description, link, due_date, is_completed)
                 VALUES (?, ?, ?, ?, ?)`,
        [title, description, link, dueDate, isCompleted],
      );
      return this.getById(result.insertId!);
    } catch (error) {
      Logger.error('Error creating todo:', { error });
      throw error;
    }
  }

  static async update(id: number, todo: ToDoItemInput): Promise<ToDoItem | undefined> {
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
      if (todo.dueDate !== undefined) {
        fields.push('due_date = ?');
        values.push(todo.dueDate);
      }
      if (todo.isCompleted !== undefined) {
        fields.push('is_completed = ?');
        values.push(todo.isCompleted ? 1 : 0);
      }
      if (fields.length === 0) {
        return;
      }
      values.push(id);

      await db.run(
        `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );
      return this.getById(id);
    } catch (error) {
      Logger.error('Error updating todo:', { error });
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await db.run('DELETE FROM todos WHERE id = ?', [id]);
    } catch (error) {
      Logger.error('Error deleting todo:', { error });
      throw error;
    }
  }
}

export default TodoService;
