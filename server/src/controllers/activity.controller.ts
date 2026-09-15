import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ActivityService } from '../services/activity.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class ActivityController {
  static async getTaskActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await ActivityService.getForTask(req.params.taskId);
      ApiResponse.success(res, 'Task activities retrieved', { activities });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await ActivityService.getForProject(req.params.projectId);
      ApiResponse.success(res, 'Project activities retrieved', { activities });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaceActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await ActivityService.getForWorkspace(req.params.workspaceId);
      ApiResponse.success(res, 'Workspace activities retrieved', { activities });
    } catch (error) {
      next(error);
    }
  }
}