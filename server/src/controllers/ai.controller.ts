import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AIService } from '../services/ai.service';
import { ApiResponse } from '../utils/apiResponse';

export class AIController {
  static async breakdown(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt } = req.body;
      const tasks = await AIService.generateTaskBreakdown(prompt);
      ApiResponse.success(res, 'Tasks generated successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }
}