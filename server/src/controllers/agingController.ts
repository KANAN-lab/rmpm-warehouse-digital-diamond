import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse } from '../utils/errorResponder.js';
import { getAgingSummaryReport, getExpiryAlerts } from '../services/agingEngineService.js';

// Get Dynamic Aging Buckets Breakdown API
export const getAgingSummary = (req: AuthenticatedRequest, res: Response) => {
  const report = getAgingSummaryReport();
  return sendSuccessResponse(req, res, report);
};

// Get Expiry Alerts List API
export const getExpiryAlertList = (req: AuthenticatedRequest, res: Response) => {
  const alerts = getExpiryAlerts();
  return sendSuccessResponse(req, res, {
    totalAlerts: alerts.length,
    alerts
  });
};
