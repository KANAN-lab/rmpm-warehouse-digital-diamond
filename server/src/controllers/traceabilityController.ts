import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { getMaterialTraceabilityGraph, mockExceptions } from '../services/traceabilityExceptionService.js';

// Get End-to-End Traceability Node Graph API
export const getTraceabilityGraph = (req: AuthenticatedRequest, res: Response) => {
  const { midCode } = req.params;
  const graph = getMaterialTraceabilityGraph(midCode);

  if (!graph) {
    return sendOperationalError(req, res, {
      code: 'TRACEABILITY_NOT_FOUND',
      message: `Data jejak pergerakan untuk MID '${midCode}' tidak ditemukan di ledger.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, graph);
};

// Get List of Active Warehouse Exceptions API
export const getActiveExceptions = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    totalExceptions: mockExceptions.length,
    exceptions: mockExceptions
  });
};
