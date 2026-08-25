"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revertTransaction = exports.createTransaction = exports.getTransactionHistory = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const transactionLedgerService_js_1 = require("../services/transactionLedgerService.js");
// Query Immutable Transaction History API
const getTransactionHistory = (req, res) => {
    const { transactionType, midCode, materialCode, locationCode, correlationId, page = 1, limit = 10 } = req.query;
    let result = [...transactionLedgerService_js_1.mockTransactionLedger];
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
        result = result.filter(t => t.sourceLocationCode?.toLowerCase().includes(loc) ||
            t.destinationLocationCode?.toLowerCase().includes(loc));
    }
    if (correlationId) {
        result = result.filter(t => t.correlationId === correlationId);
    }
    const total = result.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const paginated = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        items: paginated,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        }
    });
};
exports.getTransactionHistory = getTransactionHistory;
// Execute New Inventory Transaction
const createTransaction = (req, res) => {
    const { transactionType, sourceLocationCode, destinationLocationCode, materialCode, batchNumber, midCode, palletCode, quantity, uom, referenceDocument, reasonCode } = req.body;
    if (!transactionType || !materialCode || !midCode || !quantity || !uom) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'TXN_INVALID_INPUT',
            message: 'Tipe transaksi, material code, MID code, kuantitas, dan UOM wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const transaction = (0, transactionLedgerService_js_1.recordTransaction)({
        transactionType: transactionType,
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
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Transaksi '${transactionType}' berhasil dicatat ke ledger imutabel.`,
        transaction
    }, 201);
};
exports.createTransaction = createTransaction;
// Create Reversal Transaction for Past Transaction Correction
const revertTransaction = (req, res) => {
    const { id } = req.params;
    const { reasonCode } = req.body;
    const user = req.user;
    const result = (0, transactionLedgerService_js_1.createReversalTransaction)(id, user.id, user.username, reasonCode || 'USER_REQUESTED_REVERSAL', req.correlationId || 'corr-reversal');
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'REVERSAL_FAILED',
            message: result.error || 'Gagal membuat transaksi pembalik.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Jurnal pembalik untuk transaksi '${id}' berhasil dicatat.`,
        reversalTransaction: result.reversalTransaction
    }, 201);
};
exports.revertTransaction = revertTransaction;
