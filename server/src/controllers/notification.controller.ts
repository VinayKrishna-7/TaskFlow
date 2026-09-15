import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class NotificationController {
  static async getUserNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await NotificationService.getUserNotifications(req.user.id, page, limit);
      ApiResponse.success(
        res,
        'Notifications retrieved',
        { notifications: result.notifications, unreadCount: result.unreadCount },
        200,
        {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
      ApiResponse.success(res, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await NotificationService.markAllAsRead(req.user.id);
      ApiResponse.success(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async sendTestNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const notification = await NotificationService.sendTestAlert(req.user.id);
      ApiResponse.success(res, 'Test alert notification triggered', { notification });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await NotificationService.deleteNotification(req.params.id, req.user.id);
      ApiResponse.success(res, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }

  static async clearAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await NotificationService.clearAll(req.user.id);
      ApiResponse.success(res, 'All notifications cleared');
    } catch (error) {
      next(error);
    }
  }
}