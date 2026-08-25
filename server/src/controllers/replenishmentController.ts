import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  evaluateReplenishmentTriggers, 
  confirmReplenishmentExecution, 
  mockReplenishmentTasks 
} from '../services/replenishmentService.js';

// Trigger Min/Max Scan & Auto-Create Tasks API
export const checkReplenishmentTriggers = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const generatedTasks = evaluateReplenishmentTriggers(user.id, req.correlationId || 'corr-replenish-scan');

  return sendSuccessResponse(req, res, {
    message: `Pemeriksaan pemicu Min/Max replenishment selesai. (${generatedTasks.length} tugas baru dibuat).`,
    generatedTasks
  });
};

// List Pending Replenishment Tasks API
export const getReplenishmentTasks = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    totalTasks: mockReplenishmentTasks.length,
    tasks: mockReplenishmentTasks
  });
};

// Confirm PDA Replenishment Execution API
export const confirmReplenishment = (req: AuthenticatedRequest, res: Response) => {
  const { taskId, scannedBulkLocationCode, scannedPickingLocationCode, scannedMidCode } = req.body;

  if (!taskId || !scannedBulkLocationCode || !scannedPickingLocationCode || !scannedMidCode) {
    return sendOperationalError(req, res, {
      code: 'REPL_CONFIRM_INVALID_INPUT',
      message: 'ID Tugas, lokasi bulk, lokasi picking, dan MID code wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = confirmReplenishmentExecution({
    taskId,
    scannedBulkLocationCode,
    scannedPickingLocationCode,
    scannedMidCode,
    operatorId: user.id,
    operatorUsername: user.username,
    correlationId: req.correlationId || 'corr-confirm-replenish'
  });

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'REPL_EXECUTION_FAILED',
      message: result.error || 'Gagal mengonfirmasi pemindahan replenishment.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Pemindahan replenishment untuk tugas '${taskId}' berhasil dicatat ke ledger imutabel.`,
    task: result.task
  });
};
