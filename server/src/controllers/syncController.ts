import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  processOfflineSyncQueue, 
  mockSyncConflicts, 
  resolveSyncConflict 
} from '../services/syncService.js';

// Process Offline Queue & Detect SYNC_CONFLICT
export const syncPdaQueue = (req: AuthenticatedRequest, res: Response) => {
  const { queueItems } = req.body;

  if (!Array.isArray(queueItems) || queueItems.length === 0) {
    return sendOperationalError(req, res, {
      code: 'SYNC_EMPTY_QUEUE',
      message: 'Antrean sync PDA kosong.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = processOfflineSyncQueue(
    queueItems,
    user.id,
    user.username,
    req.correlationId || 'corr-sync'
  );

  return sendSuccessResponse(req, res, {
    message: `Sinkronisasi PDA selesai. (${result.processedCount} diproses, ${result.conflictCount} konflik dideteksi).`,
    summary: result
  });
};

// Get List of SYNC_CONFLICT Records for Supervisor Review
export const getSyncConflicts = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    totalConflicts: mockSyncConflicts.length,
    conflicts: mockSyncConflicts
  });
};

// Resolve SYNC_CONFLICT Entry
export const executeConflictResolution = (req: AuthenticatedRequest, res: Response) => {
  const { conflictId, resolution } = req.body;

  if (!conflictId || !resolution) {
    return sendOperationalError(req, res, {
      code: 'CONFLICT_INVALID_INPUT',
      message: 'ID Konflik dan jenis resolusi (ACCEPT_PDA / ACCEPT_SERVER) wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = resolveSyncConflict(conflictId, resolution, user.id);

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'RESOLVE_FAILED',
      message: result.error || 'Gagal menyelesaikan konflik sync.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Konflik sync '${conflictId}' berhasil diselesaikan dengan resolusi '${resolution}'.`,
    conflict: result.conflict
  });
};
