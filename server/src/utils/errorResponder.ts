import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';

export interface OperationalErrorOptions {
  code: string;
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export const sendOperationalError = (
  req: AuthenticatedRequest,
  res: Response,
  options: OperationalErrorOptions
) => {
  const statusCode = options.statusCode || 400;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: options.code,
      message: options.message,
      details: options.details || {}
    },
    timestamp: new Date().toISOString(),
    correlation_id: req.correlationId || 'corr-unknown'
  });
};

export const sendSuccessResponse = (
  req: AuthenticatedRequest,
  res: Response,
  data: any,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    correlation_id: req.correlationId || 'corr-unknown'
  });
};
