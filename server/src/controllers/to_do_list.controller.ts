import { Request, Response, NextFunction } from 'express';
import TodoService from '../services/todo.service';
import { NotFoundError, ValidationError, DatabaseError } from '../errors/AppError';
import { validateId, validateRequiredFields, validateAndSanitizeString } from '../utils/validation';

export class ToDoListController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const todos = await TodoService.getAll();
      res.json({ success: true, data: todos });
    } catch (err) {
      next(new DatabaseError('Failed to fetch todos', err as Error));
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');
      const todo = await TodoService.getById(id);

      if (!todo) {
        throw new NotFoundError('Todo', id);
      }

      res.json({ success: true, data: todo });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, link, dueDate, isCompleted } = req.body;

      // Validate required fields
      validateRequiredFields(req.body, ['title']);

      // Validate and sanitize title
      const sanitizedTitle = validateAndSanitizeString(title, 'title', {
        required: true,
        max: 255,
      });

      // Validate optional fields
      const sanitizedDescription = description
        ? validateAndSanitizeString(description, 'description')
        : undefined;

      const sanitizedLink = link
        ? validateAndSanitizeString(link, 'link', { max: 500 })
        : undefined;

      // Create todo
      const newToDoItem = await TodoService.create({
        title: sanitizedTitle!,
        description: sanitizedDescription,
        link: sanitizedLink,
        dueDate,
        isCompleted: !!isCompleted,
      });

      res.status(201).json({ success: true, data: newToDoItem });
    } catch (err) {
      if (err instanceof ValidationError) {
        next(err);
      } else {
        next(new DatabaseError('Failed to create todo', err as Error));
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Check if todo exists
      const existingTodo = await TodoService.getById(id);
      if (!existingTodo) {
        throw new NotFoundError('Todo', id);
      }

      const { title, description, link, dueDate, isCompleted } = req.body;

      // Build update object - service accepts partial updates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};

      // Validate and sanitize fields if provided
      if (title !== undefined) {
        const sanitizedTitle = validateAndSanitizeString(title, 'title', { max: 255 });
        if (sanitizedTitle) {
          updateData.title = sanitizedTitle;
        }
      }

      if (description !== undefined) {
        updateData.description = validateAndSanitizeString(description, 'description');
      }

      if (link !== undefined) {
        updateData.link = validateAndSanitizeString(link, 'link', { max: 500 });
      }

      if (dueDate !== undefined) {
        updateData.dueDate = dueDate;
      }

      if (isCompleted !== undefined) {
        updateData.isCompleted = isCompleted;
      }

      // Update todo
      const updatedToDoItem = await TodoService.update(id, updateData);

      res.status(200).json({ success: true, data: updatedToDoItem });
    } catch (err) {
      if (err instanceof ValidationError || err instanceof NotFoundError) {
        next(err);
      } else {
        next(new DatabaseError('Failed to update todo', err as Error));
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Check if todo exists
      const existingTodo = await TodoService.getById(id);
      if (!existingTodo) {
        throw new NotFoundError('Todo', id);
      }

      await TodoService.delete(id);
      res.status(200).json({ success: true, message: 'Todo deleted successfully' });
    } catch (err) {
      if (err instanceof ValidationError || err instanceof NotFoundError) {
        next(err);
      } else {
        next(new DatabaseError('Failed to delete todo', err as Error));
      }
    }
  }
}
