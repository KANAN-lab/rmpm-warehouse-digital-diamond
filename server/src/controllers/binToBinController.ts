import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { validateBinToBinTransfer, executeBinToBinTransfer } from '../services/binToBinService.js';

// Validate Bin-to-Bin Destination Capacity & Compatibility API
export const checkBinToBinValidation = (req: AuthenticatedRequest, res: Response) => {
  const { sourceLocationCode, destinationLocationCode, midCode, quantity } = req.body;

  if (!sourceLocationCode || !destinationLocationCode || !midCode || !quantity) {
    return sendOperationalError(req, res, {
      code: 'VALIDATE_B2B_INVALID_INPUT',
      message: 'Lokasi asal, lokasi tujuan, MID code, dan kuantitas wajib diisi.',
      statusCode: 400
    });
  }

  const validation = validateBinToBinTransfer(
    sourceLocationCode,
    destinationLocationCode,
    midCode,
    Number(quantity)
  );

  if (!validation.isValid) {
    return sendOperationalError(req, res, {
      code: 'DESTINATION_BIN_INCOMPATIBLE',
      message: validation.reason || 'Bin tujuan tidak kompatibel atau kapasitas terlampaui.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    isValid: true,
    message: `Bin tujuan '${destinationLocationCode}' valid dan siap menerima pemindahan barang dari '${sourceLocationCode}'.`
  });
};

// Execute Bin-to-Bin Transfer API
export const transferBinToBin = (req: AuthenticatedRequest, res: Response) => {
  const { sourceLocationCode, destinationLocationCode, midCode, quantity, reasonCode } = req.body;

  if (!sourceLocationCode || !destinationLocationCode || !midCode || !quantity) {
    return sendOperationalError(req, res, {
      code: 'B2B_INVALID_INPUT',
      message: 'Lokasi asal, lokasi tujuan, MID code, dan kuantitas wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = executeBinToBinTransfer({
    sourceLocationCode,
    destinationLocationCode,
    midCode,
    quantity: Number(quantity),
    reasonCode: reasonCode || 'REGULAR_SLOT_RELOCATION',
    operatorId: user.id,
    operatorUsername: user.username,
    correlationId: req.correlationId || 'corr-b2b'
  });

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'B2B_TRANSFER_FAILED',
      message: result.error || 'Gagal memindahkan barang ke bin tujuan.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Perpindahan Bin-to-Bin dari '${sourceLocationCode}' ke '${destinationLocationCode}' berhasil dicatat ke ledger imutabel.`,
    transaction: result.transaction,
    updatedBalance: result.updatedBalance
  });
};
