import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedRequest extends Request {
  correlationId?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
    departmentId?: string;
  };
  device?: {
    id: string;
    deviceCode: string;
    macAddress: string;
  };
}

export const correlationIdMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const incomingCorrelationId = req.header('X-Correlation-ID');
  const correlationId = incomingCorrelationId || `corr-${uuidv4()}`;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
};
