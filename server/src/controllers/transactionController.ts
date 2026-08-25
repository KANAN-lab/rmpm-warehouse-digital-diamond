import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  mockTransactionLedger, 
  recordTransaction, 
  createReversalTransaction, 
  TransactionType 
} from '../services/transactionLedgerService.js';

// Query Immutable Transaction History API
export const getTransactionHistory = (req: AuthenticatedRequest, res: Response) => {
  const { transactionType, midCode, materialCode, locationCode, correlationId, page = 1, limit = 10 } = req.query;

  let result = [...mockTransactionLedger];

  if (transactionType) {
    result = result.filter(t => t.transactionType === transactionType);
  }
  if (midCode) {
    result = result.filter(t => t.midCode.toLowerCase().includes(String(midCode).toLowerCase()));
  }
  if (materialCode) {
    result = result.filter(t => t.materialCode.toLowerCase().includes(String(materialCode).toLowerCase()));
  }
  if (locationCode) {
    const loc = String(locationCode).toLowerCase();
    result = result.filter(t => 
      t.sourceLocationCode?.toLowerCase().includes(loc) || 
      t.destinationLocationCode?.toLowerCase().includes(loc)
    );
  }
  if (correlationId) {
    result = result.filter(t => t.correlationId === correlationId);
  }

  const total = result.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const paginated = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return sendSuccessResponse(req, res, {
    items: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

// Execute New Inventory Transaction
export const createTransaction = (req: AuthenticatedRequest, res: Response) => {
  const { 
    transactionType, 
    sourceLocationCode, 
    destinationLocationCode, 
    materialCode, 
    batchNumber, 
    midCode, 
    palletCode, 
    quantity, 
    uom, 
    referenceDocument, 
    reasonCode 
  } = req.body;

  if (!transactionType || !materialCode || !midCode || !quantity || !uom) {
    return sendOperationalError(req, res, {
      code: 'TXN_INVALID_INPUT',
      message: 'Tipe transaksi, material code, MID code, kuantitas, dan UOM wajib diisi.',
      statusCode: 400
    });
  }

  const user = req.user!;
  const transaction = recordTransaction({
    transactionType: transactionType as TransactionType,
    sourceLocationCode,
    destinationLocationCode,
    materialCode,
    batchNumber,
    midCode,
    palletCode,
    quantity: Number(quantity),
    uom,
    operatorId: user.id,
    operatorUsername: user.username,
    deviceId: req.device?.id || 'DEV-WEB-BROWSER',
    referenceDocument,
    reasonCode,
    correlationId: req.correlationId || 'corr-unknown'
  });

  return sendSuccessResponse(req, res, {
    message: `Transaksi '${transactionType}' berhasil dicatat ke ledger imutabel.`,
    transaction
  }, 201);
};

// Create Reversal Transaction for Past Transaction Correction
export const revertTransaction = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reasonCode } = req.body;

  const user = req.user!;
  const result = createReversalTransaction(
    id,
    user.id,
    user.username,
    reasonCode || 'USER_REQUESTED_REVERSAL',
    req.correlationId || 'corr-reversal'
  );

  if (!result.success) {
    return sendOperationalError(req, res, {
      code: 'REVERSAL_FAILED',
      message: result.error || 'Gagal membuat transaksi pembalik.',
      statusCode: 400
    });
  }

  return sendSuccessResponse(req, res, {
    message: `Jurnal pembalik untuk transaksi '${id}' berhasil dicatat.`,
    reversalTransaction: result.reversalTransaction
  }, 201);
};
