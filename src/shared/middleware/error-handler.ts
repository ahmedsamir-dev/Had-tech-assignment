import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { logger } from '@/shared/logger';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class ApiError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

interface ZodValidationError {
  issues: Array<{
    validation: string;
    code: string;
    message: string;
    path: (string | number)[];
  }>;
}

const isZodValidationError = (error: any): error is ZodValidationError => {
  return error && Array.isArray(error.issues) && error.issues.length > 0;
};

const formatZodError = (zodError: ZodValidationError): string => {
  return zodError.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    })
    .join('; ');
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';

  if (isZodValidationError(err)) {
    statusCode = httpStatus.BAD_REQUEST;
    message = formatZodError(err);
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  logger.error('Validation error:', {
    error: {
      message,
      stack: err.stack,
      statusCode,
      name: err.name,
      ...(err.constructor?.name && { type: err.constructor.name }),
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
