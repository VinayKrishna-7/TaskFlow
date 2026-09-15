import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { TaskService } from '../services/task.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import crypto from 'crypto';
import path from 'path';

export class TaskController {
  static async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.createTask({
        ...req.body,
        reporter: req.user.id,
      });
      ApiResponse.created(res, 'Task created successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaskService.getTasks(req.query as any);
      ApiResponse.success(res, 'Tasks retrieved successfully', { tasks: result.tasks }, 200, {
        page: result.page,
        limit: Number(req.query.limit) || 50,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      ApiResponse.success(res, 'Task retrieved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.updateTask(req.params.id, req.body, req.user.id);
      ApiResponse.success(res, 'Task updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async moveTaskPosition(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { status, position } = req.body;
      const task = await TaskService.moveTaskPosition(req.params.id, status, position, req.user.id);
      ApiResponse.success(res, 'Task position moved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await TaskService.deleteTask(req.params.id, req.user.id);
      ApiResponse.success(res, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async duplicateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const task = await TaskService.duplicateTask(req.params.id, req.user.id);
      ApiResponse.created(res, 'Task duplicated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async addSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title } = req.body;
      const task = await TaskService.addSubtask(req.params.id, title);
      ApiResponse.created(res, 'Subtask added successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async toggleSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.toggleSubtask(req.params.id, req.params.subtaskId);
      ApiResponse.success(res, 'Subtask toggled successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.deleteSubtask(req.params.id, req.params.subtaskId);
      ApiResponse.success(res, 'Subtask deleted successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async logTime(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { durationMinutes, description, startTime, endTime } = req.body;
      const task = await TaskService.logTime(
        req.params.id,
        req.user.id,
        durationMinutes,
        description,
        startTime ? new Date(startTime) : undefined,
        endTime ? new Date(endTime) : undefined
      );
      ApiResponse.success(res, 'Time logged successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAttachment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      if (!req.file) throw AppError.badRequest('No file uploaded');

      const task = await TaskService.getTaskById(req.params.id);
      const attachment = {
        id: crypto.randomUUID(),
        name: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id as any,
        uploadedAt: new Date(),
      };

      task.attachments.push(attachment);
      await task.save();

      ApiResponse.created(res, 'Attachment uploaded successfully', { attachment });
    } catch (error) {
      next(error);
    }
  }
}