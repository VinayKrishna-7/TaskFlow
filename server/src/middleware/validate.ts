import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|query|params)./, ''),
          message: e.message,
        }));
        const combinedMessage = issues.map((i) => i.message).join('. ') || 'Validation failed';
        ApiResponse.error(res, combinedMessage, 400, 'VALIDATION_ERROR', issues);
        return;
      }
      next(error);
    }
  };
};
