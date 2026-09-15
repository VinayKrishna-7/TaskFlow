import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { CommentService } from '../services/comment.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class CommentController {
  static async addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { content } = req.body;
      const comment = await CommentService.addComment(req.params.taskId, req.user.id, content);
      ApiResponse.created(res, 'Comment added successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const comments = await CommentService.getTaskComments(req.params.taskId);
      ApiResponse.success(res, 'Comments retrieved successfully', { comments });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await CommentService.deleteComment(req.params.id, req.user.id, req.user.role === 'ADMIN');
      ApiResponse.success(res, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}