"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReversalTransaction = exports.recordTransaction = exports.mockTransactionLedger = void 0;
const uuid_1 = require("uuid");
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const eventBus_js_1 = require("./eventBus.js");
// In-Memory Immutable Transaction Ledger (APPEND-ONLY)
exports.mockTransactionLedger = [
    {
        transactionId: 'txn-001-receiving',
        transactionType: 'RECEIVING',
        destinationLocationId: 'loc-staging-in-01',
        destinationLocationCode: 'DOCK-IN-01',
        materialId: 'mat-001',
        materialCode: 'RM-RESIN-001',
        batchNumber: 'BATCH-RM-88421',
        midCode: 'MID-2026-994821',
        palletCode: 'PAL-EUR-001',
        quantity: 1000.00,
        uom: 'KG',
        operatorId: 'usr-admin-001',
        operatorUsername: 'admin',
        deviceId: 'DEV-DESKTOP-01',
        timestamp: '2026-02-01T10:00:00Z',
        referenceDocument: 'PO-2026-00918',
        reasonCode: 'INBOUND_PURCHASE',
        status: 'SUCCESS',
        correlationId: 'corr-init-001',
        previousState: {},
        newState: { quantity: 1000, status: 'AVAILABLE' }
    },
    {
        transactionId: 'txn-002-putaway',
        transactionType: 'PUTAWAY',
        sourceLocationId: 'loc-staging-in-01',
        sourceLocationCode: 'DOCK-IN-01',
        destinationLocationId: 'loc-bin-a01-l02-b04',
        destinationLocationCode: 'A01-R03-L02-B04',
        materialId: 'mat-001',
        materialCode: 'RM-RESIN-001',
        batchNumber: 'BATCH-RM-88421',
        midCode: 'MID-2026-994821',
        palletCode: 'PAL-EUR-001',
        quantity: 1000.00,
        uom: 'KG',
        operatorId: 'usr-putaway-01',
        operatorUsername: 'putaway_op',
        deviceId: 'PDA-DEV-004',
        timestamp: '2026-02-01T10:30:00Z',
        referenceDocument: 'PUTAWAY-2026-001',
        reasonCode: 'REGULAR_PUTAWAY',
        status: 'SUCCESS',
        correlationId: 'corr-init-002',
        previousState: { locationCode: 'DOCK-IN-01' },
        newState: { locationCode: 'A01-R03-L02-B04' }
    }
];
// Append Transaction to Immutable Ledger & Update Balance Atomicly
const recordTransaction = (params) => {
    const transactionId = `txn-${Date.now()}-${(0, uuid_1.v4)().substring(0, 6)}`;
    // Find target inventory balance
    let balance = inventoryStateService_js_1.mockInventoryBalances.find(b => b.midCode === params.midCode);
    const previousState = balance ? { ...balance } : {};
    if (balance) {
        if (params.destinationLocationCode) {
            balance.locationCode = params.destinationLocationCode;
        }
        if (params.transactionType === 'PICKING' || params.transactionType === 'DISPATCH') {
            balance.quantity = Math.max(0, balance.quantity - params.quantity);
        }
        else if (params.transactionType === 'RECEIVING' || params.transactionType === 'RETURN') {
            balance.quantity += params.quantity;
        }
        balance.lastMovementAt = new Date().toISOString();
    }
    const newTxn = {
        transactionId,
        transactionType: params.transactionType,
        sourceLocationCode: params.sourceLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        materialId: `mat-${params.materialCode}`,
        materialCode: params.materialCode,
        batchNumber: params.batchNumber,
        midCode: params.midCode,
        palletCode: params.palletCode,
        quantity: params.quantity,
        uom: params.uom,
        operatorId: params.operatorId,
        operatorUsername: params.operatorUsername,
        deviceId: params.deviceId,
        timestamp: new Date().toISOString(),
        referenceDocument: params.referenceDocument,
        reasonCode: params.reasonCode,
        status: 'SUCCESS',
        correlationId: params.correlationId,
        previousState,
        newState: balance ? { ...balance } : {}
    };
    // Append-only commit
    exports.mockTransactionLedger.push(newTxn);
    // Map Transaction Type to Domain Event Type
    const eventMap = {
        RECEIVING: 'InventoryReceived',
        PUTAWAY: 'InventoryPutAway',
        PICKING: 'InventoryPicked',
        BATCHING: 'InventoryBatched',
        REPLENISHMENT: 'InventoryReplenished',
        BIN_TO_BIN: 'InventoryMoved',
        TRANSFER: 'InventoryMoved',
        RETURN: 'InventoryReceived',
        ADJUSTMENT: 'AdjustmentApproved',
        CYCLE_COUNT: 'CountRecorded',
        STAGED: 'InventoryMoved',
        DISPATCH: 'InventoryMoved',
        HOLD: 'InventoryMoved',
        RELEASE: 'InventoryMoved',
        DAMAGE: 'InventoryMoved',
        SCRAP: 'InventoryMoved'
    };
    const domainEventType = eventMap[params.transactionType] || 'InventoryMoved';
    eventBus_js_1.eventBus.publish(domainEventType, newTxn, params.correlationId);
    return newTxn;
};
exports.recordTransaction = recordTransaction;
// Create Reversal Transaction (Jurnal Pembalik / Koreksi Transaksi Imutabel)
const createReversalTransaction = (originalTransactionId, operatorId, operatorUsername, reasonCode, correlationId) => {
    const original = exports.mockTransactionLedger.find(t => t.transactionId === originalTransactionId);
    if (!original) {
        return { success: false, error: `Transaksi asal dengan ID '${originalTransactionId}' tidak ditemukan.` };
    }
    if (original.status === 'REVERTED') {
        return { success: false, error: `Transaksi '${originalTransactionId}' sudah pernah dibalikkan sebelumnya.` };
    }
    // Mark original as REVERTED
    original.status = 'REVERTED';
    // Create Reversal Entry with inverted source and destination
    const reversalTxn = (0, exports.recordTransaction)({
        transactionType: 'ADJUSTMENT',
        sourceLocationCode: original.destinationLocationCode,
        destinationLocationCode: original.sourceLocationCode,
        materialCode: original.materialCode,
        batchNumber: original.batchNumber,
        midCode: original.midCode,
        palletCode: original.palletCode,
        quantity: original.quantity,
        uom: original.uom,
        operatorId,
        operatorUsername,
        deviceId: original.deviceId,
        referenceDocument: `REVERSAL-OF-${original.transactionId}`,
        reasonCode: reasonCode || 'CORRECTION_REVERSAL',
        correlationId
    });
    reversalTxn.isReversal = true;
    reversalTxn.reversalOfTransactionId = originalTransactionId;
    return { success: true, reversalTransaction: reversalTxn };
};
exports.createReversalTransaction = createReversalTransaction;
