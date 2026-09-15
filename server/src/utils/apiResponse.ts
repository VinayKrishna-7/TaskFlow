import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message = 'Success',
    data?: T,
    statusCode = 200,
    pagination?: ApiResponseData['pagination']
  ): Response {
    const responseBody: ApiResponseData<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(responseBody);
  }

  static created<T>(res: Response, message = 'Created successfully', data?: T): Response {
    return this.success(res, message, data, 201);
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: any
  ): Response {
    const responseBody: ApiResponseData = {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }),
      },
    };
    return res.status(statusCode).json(responseBody);
  }
}
