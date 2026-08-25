import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  createProductionBatch, 
  transitionBatchStatus, 
  mockProductionBatches, 
  BatchProductionStatus 
} from '../services/batchingService.js';

// Create Material Production Batch API
export const createBatch = (req: AuthenticatedRequest, res: Response) => {
  const { workOrderNumber, materialCode, targetQuantity, uom } = req.body;

  if (!workOrderNumber || !materialCode || !targetQuantity || !uom) {
    return sendOperationalError(req, res, {
      code: 'BATCH_INVALID_INPUT',
      message: 'Nomor Work Order, material code, target quantity, dan UOM wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const batch = createProductionBatch({
    workOrderNumber,
    materialCode,
    targetQuantity: Number(targetQuantity),
    uom,
    createdBy: user.id,
    correlationId: req.correlationId || 'corr-batch-create'
  });

  return sendSuccessResponse(req, res, {
    message: `Batch produksi '${batch.batchNumber}' berhasil dibuat dan diasosiasikan dengan Work Order '${workOrderNumber}'.`,
    batch
  }, 201);
};

// Transition Batch Status API
export const updateBatchStatus = (req: AuthenticatedRequest, res: Response) => {
  const { batchNumber, newStatus } = req.body;

  if (!batchNumber || !newStatus) {
    return sendOperationalError(req, res, {
      code: 'BATCH_STATUS_INVALID_INPUT',
      message: 'Nomor batch dan new status (PREPARATION / MIXED / RELEASED_TO_PRODUCTION) wajib diisi.',
      statusCode: 400
    });
  }

  const result = transitionBatchStatus(
    batchNumber,
    newStatus as BatchProductionStatus,
    req.correlationId || 'corr-batch-status'
  );

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'BATCH_STATUS_UPDATE_FAILED',
      message: result.error || 'Gagal mengubah status batch.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Status batch produksi '${batchNumber}' berhasil diubah menjadi '${newStatus}'.`,
    batch: result.batch
  });
};

// List Production Batches API
export const getBatches = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    totalBatches: mockProductionBatches.length,
    batches: mockProductionBatches
  });
};
