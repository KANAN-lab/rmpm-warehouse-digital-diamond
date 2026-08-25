import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  receiveInboundShipment, 
  executeQualityInspection, 
  generatePutawaySuggestion, 
  confirmPutawayExecution 
} from '../services/receivingPutawayService.js';

// Inbound PO / ASN Receiving at Dock API
export const receiveInbound = (req: AuthenticatedRequest, res: Response) => {
  const { poNumber, materialCode, materialName, batchNumber, quantity, uom, manufactureDate, expiryDate } = req.body;

  if (!poNumber || !materialCode || !batchNumber || !quantity || !uom) {
    return sendOperationalError(req, res, {
      code: 'RECEIVING_INVALID_INPUT',
      message: 'Nomor PO, material code, batch number, kuantitas, dan UOM wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = receiveInboundShipment({
    poNumber,
    materialCode,
    materialName: materialName || materialCode,
    batchNumber,
    quantity: Number(quantity),
    uom,
    manufactureDate,
    expiryDate,
    operatorId: user.id,
    operatorUsername: user.username,
    correlationId: req.correlationId || 'corr-receiving'
  });

  return sendSuccessResponse(req, res, {
    message: `Penerimaan fisik Inbound PO '${poNumber}' berhasil dicatat di Inbound Dock. Tag MID baru: '${result.midCode}'.`,
    midCode: result.midCode,
    inventory: result.inventory,
    transaction: result.transaction
  }, 201);
};

// Quality Control Inspection API
export const inspectQuality = (req: AuthenticatedRequest, res: Response) => {
  const { midCode, result, notes } = req.body;

  if (!midCode || !result) {
    return sendOperationalError(req, res, {
      code: 'QC_INVALID_INPUT',
      message: 'MID code dan hasil QC (PASSED / REJECTED) wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const qcResult = executeQualityInspection({
    midCode,
    result,
    inspectorUserId: user.id,
    inspectorUsername: user.username,
    notes,
    correlationId: req.correlationId || 'corr-qc'
  });

  if (!qcResult.success) {
    return sendOperationalError(req, res, {
      code: 'QC_INSPECTION_FAILED',
      message: qcResult.error || 'Gagal memperbarui status QC.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Inspeksi QC untuk MID '${midCode}' selesai dengan hasil '${result}'. Status inventaris kini '${qcResult.item?.status}'.`,
    inventory: qcResult.item
  });
};

// Get Putaway Bin Suggestion API
export const getPutawaySuggestion = (req: AuthenticatedRequest, res: Response) => {
  const { midCode } = req.params;
  const suggestion = generatePutawaySuggestion(midCode);

  if (!suggestion) {
    return sendOperationalError(req, res, {
      code: 'MID_NOT_FOUND',
      message: `Tag MID '${midCode}' tidak ditemukan di sistem.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, suggestion);
};

// Confirm PDA Putaway Execution API
export const confirmPutaway = (req: AuthenticatedRequest, res: Response) => {
  const { midCode, scannedBinCode } = req.body;

  if (!midCode || !scannedBinCode) {
    return sendOperationalError(req, res, {
      code: 'PUTAWAY_INVALID_INPUT',
      message: 'MID code dan scanned bin code wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const result = confirmPutawayExecution({
    midCode,
    scannedBinCode,
    operatorId: user.id,
    operatorUsername: user.username,
    correlationId: req.correlationId || 'corr-putaway'
  });

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'PUTAWAY_EXECUTION_FAILED',
      message: result.error || 'Gagal mengeksekusi putaway.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Putaway MID '${midCode}' ke bin '${scannedBinCode}' berhasil dicatat ke ledger imutabel.`,
    transaction: result.transaction,
    updatedBalance: result.updatedBalance
  });
};
