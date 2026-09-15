import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const project = await ProjectService.createProject({
        ...req.body,
        owner: req.user.id,
      });
      ApiResponse.created(res, 'Project created successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaceProjects(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.query.workspaceId as string || req.params.workspaceId;
      if (!workspaceId) throw AppError.badRequest('workspaceId is required');
      const projects = await ProjectService.getWorkspaceProjects(workspaceId);
      ApiResponse.success(res, 'Projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      ApiResponse.success(res, 'Project details retrieved', { project });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const project = await ProjectService.updateProject(req.params.id, req.body, req.user.id);
      ApiResponse.success(res, 'Project updated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await ProjectService.deleteProject(req.params.id, req.user.id);
      ApiResponse.success(res, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}