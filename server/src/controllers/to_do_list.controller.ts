import { Request, Response } from 'express';
import TodoService from '../services/todo.service';

export class ToDoListController {
  async getAll(req: Request, res: Response) {
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
      const { title, description, link, dueDate, isCompleted } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const newToDoItem = await TodoService.create({
        title,
        description,
        link,
        dueDate,
        isCompleted: !!isCompleted,
      });
      res.status(201).json(newToDoItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const getExistingTodo = await TodoService.getById(id);
      if (!getExistingTodo) {
        return res.status(404).json({ error: 'ToDo item not found' });
      }
      const { title, description, link, dueDate, isCompleted } = req.body;
      const updatedToDoItem = await TodoService.update(id, { title, description, link, dueDate, isCompleted });
      res.status(200).send(updatedToDoItem);
    } catch {
      res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await TodoService.delete(id);
      res.status(200).send({ success: true });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to delete todo' });
    }
  }

}
