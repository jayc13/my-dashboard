import { Request, Response } from 'express';
import TodoService from '../services/todo.service';

export class ToDoListController {
  async getAll(req: Request, res: Response ) {
    try {
      const todos = await TodoService.getAll();
      res.json(todos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const todo = await TodoService.getById(id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(todo);
    } catch {
      res.status(500).json({ error: 'Failed to fetch todo' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, description, link, due_date, is_completed } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const id = await TodoService.create({
        title,
        description,
        link,
        due_date,
        is_completed: !!is_completed,
      });
      res.status(201).json({ id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { title, description, link, due_date, is_completed } = req.body;
      await TodoService.update(id, { title, description, link, due_date, is_completed });
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await TodoService.delete(id);
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  }
}

