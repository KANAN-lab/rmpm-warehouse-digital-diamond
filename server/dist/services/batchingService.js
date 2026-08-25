"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionBatchStatus = exports.createProductionBatch = exports.mockProductionBatches = void 0;
const transactionLedgerService_js_1 = require("./transactionLedgerService.js");
const eventBus_js_1 = require("./eventBus.js");
exports.mockProductionBatches = [
    {
        batchId: 'pbatch-001',
        batchNumber: 'BATCH-PROD-2026-001',
        workOrderNumber: 'WO-2026-99182',
        materialCode: 'RM-RESIN-001',
        targetQuantity: 2500.00,
        uom: 'KG',
        status: 'PREPARATION',
        createdBy: 'usr-admin-001',
        createdAt: '2026-02-10T08:00:00Z',
        updatedAt: '2026-02-10T08:00:00Z'
    }
];
// 1. Create Production Batch & Associate with Work Order
const createProductionBatch = (params) => {
    const batchId = `pbatch-${Date.now()}`;
    const batchNumber = `BATCH-PROD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBatch = {
        batchId,
        batchNumber,
        workOrderNumber: params.workOrderNumber,
        materialCode: params.materialCode,
        targetQuantity: params.targetQuantity,
        uom: params.uom,
        status: 'PREPARATION',
        createdBy: params.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    exports.mockProductionBatches.push(newBatch);
    // Record Immutable BATCHING Transaction
    (0, transactionLedgerService_js_1.recordTransaction)({
        transactionType: 'BATCHING',
        materialCode: params.materialCode,
        batchNumber,
        midCode: `MID-BATCH-${batchNumber}`,
        quantity: params.targetQuantity,
        uom: params.uom,
        operatorId: params.createdBy,
        operatorUsername: 'operator',
        referenceDocument: params.workOrderNumber,
        reasonCode: 'PRODUCTION_BATCH_CREATION',
        correlationId: params.correlationId
    });
    eventBus_js_1.eventBus.publish('InventoryBatched', { batchNumber, workOrderNumber: params.workOrderNumber }, params.correlationId);
    return newBatch;
};
exports.createProductionBatch = createProductionBatch;
// 2. Transition Batch Status Tracking
const transitionBatchStatus = (batchNumber, newStatus, correlationId) => {
    const batch = exports.mockProductionBatches.find(b => b.batchNumber === batchNumber);
    if (!batch)
        return { success: false, error: `Batch produksi '${batchNumber}' tidak ditemukan.` };
    batch.status = newStatus;
    batch.updatedAt = new Date().toISOString();
    return { success: true, batch };
};
exports.transitionBatchStatus = transitionBatchStatus;
