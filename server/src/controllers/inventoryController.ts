import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  searchInventoryBalances, 
  mockInventoryBalances, 
  transitionInventoryStatus, 
  InventoryStatus 
} from '../services/inventoryStateService.js';

// Search Current Inventory Balances API
export const getInventoryBalances = (req: AuthenticatedRequest, res: Response) => {
  const { midCode, materialCode, batchNumber, palletCode, locationCode, status } = req.query;

  const items = searchInventoryBalances({
    midCode: midCode ? String(midCode) : undefined,
    materialCode: materialCode ? String(materialCode) : undefined,
    batchNumber: batchNumber ? String(batchNumber) : undefined,
    palletCode: palletCode ? String(palletCode) : undefined,
    locationCode: locationCode ? String(locationCode) : undefined,
    status: status ? String(status) : undefined
  });

  return sendSuccessResponse(req, res, {
    totalItems: items.length,
    balances: items
  });
};

// Lookup Specific MID Details
export const getMidDetails = (req: AuthenticatedRequest, res: Response) => {
  const { midCode } = req.params;
  const item = mockInventoryBalances.find(b => b.midCode === midCode);

  if (!item) {
    return sendOperationalError(req, res, {
      code: 'MID_NOT_FOUND',
      message: `Tag MID '${midCode}' tidak ditemukan di sistem inventaris.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, {
    mid: item
  });
};

// Transition Inventory Status via State Machine
export const executeStatusTransition = (req: AuthenticatedRequest, res: Response) => {
  const { midCode, targetStatus, reasonCode } = req.body;

  if (!midCode || !targetStatus || !reasonCode) {
    return sendOperationalError(req, res, {
      code: 'TRANSITION_INVALID_INPUT',
      message: 'Kode MID, target status, dan reason code wajib diisi.',
      statusCode: 400
    });
  }

  const result = transitionInventoryStatus(midCode, targetStatus as InventoryStatus, reasonCode);

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'INVALID_STATUS_TRANSITION',
      message: result.error || 'Gagal mengubah status inventaris.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Status MID '${midCode}' berhasil diubah menjadi '${targetStatus}'.`,
    inventory: result.item
  });
};
