import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  allocateStockForPicking, 
  createPickListWithRoute, 
  confirmPickingExecution, 
  mockPickLists, 
  PickingStrategy 
} from '../services/pickingService.js';

// Auto-Allocation Preview API (FIFO / FEFO)
export const allocateStockPreview = (req: AuthenticatedRequest, res: Response) => {
  const { materialCode, requestedQty, strategy = 'FEFO' } = req.body;

  if (!materialCode || !requestedQty) {
    return sendOperationalError(req, res, {
      code: 'ALLOCATE_INVALID_INPUT',
      message: 'Material code dan requested quantity wajib diisi.',
      statusCode: 400
    });
  }

  const result = allocateStockForPicking(materialCode, Number(requestedQty), strategy as PickingStrategy);

  return sendSuccessResponse(req, res, {
    materialCode,
    requestedQty: Number(requestedQty),
    strategy,
    allocatedCount: result.allocatedItems.length,
    unfulfilledQty: result.unfulfilledQty,
    allocatedItems: result.allocatedItems
  });
};

// Create Pick List & Route Optimization API
export const createPickList = (req: AuthenticatedRequest, res: Response) => {
  const { materialCode, requestedQty, strategy = 'FEFO' } = req.body;

  if (!materialCode || !requestedQty) {
    return sendOperationalError(req, res, {
      code: 'PICKLIST_INVALID_INPUT',
      message: 'Material code dan requested quantity wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const pickList = createPickListWithRoute({
    materialCode,
    requestedQty: Number(requestedQty),
    strategy: strategy as PickingStrategy,
    createdBy: user.id,
    correlationId: req.correlationId || 'corr-picklist'
  });

  return sendSuccessResponse(req, res, {
    message: `Pick List '${pickList.pickListCode}' berhasil dibuat dengan rute pengambilan optimum.`,
    pickList
  }, 201);
};

// Get Pick List Details
export const getPickListDetails = (req: AuthenticatedRequest, res: Response) => {
  const { pickListId } = req.params;
  const pickList = mockPickLists.find(p => p.pickListId === pickListId || p.pickListCode === pickListId);

  if (!pickList) {
    return sendOperationalError(req, res, {
      code: 'PICKLIST_NOT_FOUND',
      message: `Pick List '${pickListId}' tidak ditemukan.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, pickList);
};

// Confirm PDA Picking & Shortage Handling API
export const confirmPicking = (req: AuthenticatedRequest, res: Response) => {
  const { pickListId, taskId, scannedLocationCode, scannedMidCode, actualPickedQty } = req.body;

  if (!pickListId || !taskId || !scannedLocationCode || !scannedMidCode || actualPickedQty === undefined) {
    return sendOperationalError(req, res, {
      code: 'CONFIRM_PICK_INVALID_INPUT',
      message: 'ID Picklist, Task ID, scanned location, scanned MID, dan actual picked qty wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = confirmPickingExecution({
    pickListId,
    taskId,
    scannedLocationCode,
    scannedMidCode,
    actualPickedQty: Number(actualPickedQty),
    operatorId: user.id,
    operatorUsername: user.username,
    correlationId: req.correlationId || 'corr-confirm-pick'
  });

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'PICK_EXECUTION_FAILED',
      message: result.error || 'Gagal mengonfirmasi pengambilan barang.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: 'Eksekusi pengambilan barang berhasil dicatat ke ledger imutabel.',
    task: result.task
  });
};
