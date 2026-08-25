import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  createCycleCountOrder, 
  getBlindTaskForCounter, 
  recordBlindPhysicalCount, 
  calculateDynamicReconciliation, 
  assignIndependentRecount, 
  CycleCountMode 
} from '../services/blindCycleCountService.js';

// Create Cycle Count Order in 11 Modes + Snapshot
export const createOrder = (req: AuthenticatedRequest, res: Response) => {
  const { mode, targetCriteria } = req.body;

  if (!mode || !targetCriteria) {
    return sendOperationalError(req, res, {
      code: 'SO_INVALID_INPUT',
      message: 'Mode hitung SO dan target kriteria wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const order = createCycleCountOrder({
    mode: mode as CycleCountMode,
    targetCriteria,
    createdBy: user.id,
    correlationId: req.correlationId || 'corr-so-create'
  });

  return sendSuccessResponse(req, res, {
    message: `Order Blind SO '${order.orderCode}' berhasil dibuat dalam Mode '${mode}'. Snapshot awal t_0 berhasil di-generate.`,
    order
  }, 201);
};

// Get Blind Counter Screen (MUTLAK: HIDING SYSTEM QTY)
export const getBlindTask = (req: AuthenticatedRequest, res: Response) => {
  const { taskId } = req.params;
  const task = getBlindTaskForCounter(taskId);

  if (!task) {
    return sendOperationalError(req, res, {
      code: 'TASK_NOT_FOUND',
      message: `Tugas hitung SO '${taskId}' tidak ditemukan.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, task);
};

// Record Blind Physical Count Entry
export const recordPhysicalEntry = (req: AuthenticatedRequest, res: Response) => {
  const { 
    cycleCountId, 
    targetId, 
    locationCode, 
    scannedCode, 
    batchNumber, 
    physicalQty, 
    uom, 
    isLocationEmpty, 
    inputMode, 
    counterAttempt 
  } = req.body;

  if (!cycleCountId || !locationCode || (!scannedCode && !isLocationEmpty)) {
    return sendOperationalError(req, res, {
      code: 'ENTRY_INVALID_INPUT',
      message: 'ID SO, kode lokasi, dan scanned code (atau flag empty) wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const entry = recordBlindPhysicalCount({
    cycleCountId,
    targetId: targetId || `tgt-${Date.now()}`,
    locationCode,
    scannedCode: scannedCode || 'LOCATION_EMPTY',
    batchNumber,
    physicalQty: Number(physicalQty || 0),
    uom: uom || 'KG',
    isLocationEmpty: Boolean(isLocationEmpty),
    counterUserId: user.id,
    counterUsername: user.username,
    inputMode: inputMode || 'SCAN',
    counterAttempt: counterAttempt || 'COUNT_A',
    correlationId: req.correlationId || 'corr-entry'
  });

  return sendSuccessResponse(req, res, {
    message: 'Hasil hitung fisik blind berhasil disimpan secara imutabel.',
    entry
  }, 201);
};

// Get Dynamic Reconciliation (Supervisor Only)
export const getReconciliationReport = (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const report = calculateDynamicReconciliation(orderId);

  if (!report) {
    return sendOperationalError(req, res, {
      code: 'RECONCILIATION_NOT_FOUND',
      message: `Laporan rekonsiliasi untuk SO ID '${orderId}' tidak ditemukan.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, report);
};

// Assign Independent Recount Counter B
export const requestRecount = (req: AuthenticatedRequest, res: Response) => {
  const { orderId, targetId, counterBUserId } = req.body;

  if (!orderId || !targetId || !counterBUserId) {
    return sendOperationalError(req, res, {
      code: 'RECOUNT_INVALID_INPUT',
      message: 'ID Order, Target ID, dan User ID Counter B wajib diisi.',
      statusCode: 400
    });
  }

  const result = assignIndependentRecount(orderId, targetId, counterBUserId, req.correlationId || 'corr-recount');

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'RECOUNT_FAILED',
      message: result.error || 'Gagal mengalokasikan recount.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: result.message
  });
};
