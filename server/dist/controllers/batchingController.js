"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatches = exports.updateBatchStatus = exports.createBatch = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const batchingService_js_1 = require("../services/batchingService.js");
// Create Material Production Batch API
const createBatch = (req, res) => {
    const { workOrderNumber, materialCode, targetQuantity, uom } = req.body;
    if (!workOrderNumber || !materialCode || !targetQuantity || !uom) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'BATCH_INVALID_INPUT',
            message: 'Nomor Work Order, material code, target quantity, dan UOM wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const batch = (0, batchingService_js_1.createProductionBatch)({
        workOrderNumber,
        materialCode,
        targetQuantity: Number(targetQuantity),
        uom,
        createdBy: user.id,
        correlationId: req.correlationId || 'corr-batch-create'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Batch produksi '${batch.batchNumber}' berhasil dibuat dan diasosiasikan dengan Work Order '${workOrderNumber}'.`,
        batch
    }, 201);
};
exports.createBatch = createBatch;
// Transition Batch Status API
const updateBatchStatus = (req, res) => {
    const { batchNumber, newStatus } = req.body;
    if (!batchNumber || !newStatus) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'BATCH_STATUS_INVALID_INPUT',
            message: 'Nomor batch dan new status (PREPARATION / MIXED / RELEASED_TO_PRODUCTION) wajib diisi.',
            statusCode: 400
        });
    }
    const result = (0, batchingService_js_1.transitionBatchStatus)(batchNumber, newStatus, req.correlationId || 'corr-batch-status');
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'BATCH_STATUS_UPDATE_FAILED',
            message: result.error || 'Gagal mengubah status batch.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Status batch produksi '${batchNumber}' berhasil diubah menjadi '${newStatus}'.`,
        batch: result.batch
    });
};
exports.updateBatchStatus = updateBatchStatus;
// List Production Batches API
const getBatches = (req, res) => {
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalBatches: batchingService_js_1.mockProductionBatches.length,
        batches: batchingService_js_1.mockProductionBatches
    });
};
exports.getBatches = getBatches;
