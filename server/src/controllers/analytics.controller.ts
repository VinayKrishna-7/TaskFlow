import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class AnalyticsController {
  static async getWorkspaceAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId || req.query.workspaceId as string;
      if (!workspaceId) throw AppError.badRequest('Workspace ID is required');

      const analytics = await AnalyticsService.getWorkspaceAnalytics(workspaceId);
      ApiResponse.success(res, 'Analytics generated successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}