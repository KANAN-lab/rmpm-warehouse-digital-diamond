"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmReplenishmentExecution = exports.evaluateReplenishmentTriggers = exports.mockReplenishmentTasks = exports.mockReplenishmentThresholds = void 0;
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const transactionLedgerService_js_1 = require("./transactionLedgerService.js");
const eventBus_js_1 = require("./eventBus.js");
exports.mockReplenishmentThresholds = [
    {
        materialCode: 'RM-RESIN-001',
        pickingLocationCode: 'A01-R03-L02-B04',
        minQtyThreshold: 200.00,
        maxQtyTarget: 1000.00,
        uom: 'KG'
    }
];
exports.mockReplenishmentTasks = [];
// 1. Trigger Engine: Scan Bins Below Min Qty Threshold & Auto-Create Tasks
const evaluateReplenishmentTriggers = (createdBy, correlationId) => {
    const generatedTasks = [];
    for (const rule of exports.mockReplenishmentThresholds) {
        const currentPickingStock = inventoryStateService_js_1.mockInventoryBalances.find(b => b.locationCode === rule.pickingLocationCode);
        const currentQty = currentPickingStock ? currentPickingStock.quantity : 0;
        if (currentQty <= rule.minQtyThreshold) {
            // Find Bulk Storage Source Stock
            const bulkSource = inventoryStateService_js_1.mockInventoryBalances.find(b => b.materialCode === rule.materialCode && b.locationCode !== rule.pickingLocationCode && b.quantity > 0);
            const replenishNeeded = rule.maxQtyTarget - currentQty;
            const transferQty = bulkSource ? Math.min(bulkSource.quantity, replenishNeeded) : replenishNeeded;
            const taskId = `repl-${Date.now()}`;
            const taskCode = `REPL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newTask = {
                taskId,
                taskCode,
                materialCode: rule.materialCode,
                materialName: bulkSource ? bulkSource.materialName : 'Raw Material Pellets',
                bulkLocationCode: bulkSource ? bulkSource.locationCode : 'BULK-ZONE-B01',
                pickingLocationCode: rule.pickingLocationCode,
                midCode: bulkSource ? bulkSource.midCode : 'MID-2026-AUTO',
                quantity: transferQty,
                uom: rule.uom,
                status: 'PENDING',
                createdBy,
                createdAt: new Date().toISOString()
            };
            exports.mockReplenishmentTasks.push(newTask);
            generatedTasks.push(newTask);
            eventBus_js_1.eventBus.publish('InventoryReplenished', { taskCode, transferQty, location: rule.pickingLocationCode }, correlationId);
        }
    }
    return generatedTasks;
};
exports.evaluateReplenishmentTriggers = evaluateReplenishmentTriggers;
// 2. Confirm PDA Execution of Replenishment Transfer
const confirmReplenishmentExecution = (params) => {
    const task = exports.mockReplenishmentTasks.find(t => t.taskId === params.taskId);
    if (!task)
        return { success: false, error: 'Tugas replenishment tidak ditemukan.' };
    if (task.bulkLocationCode !== params.scannedBulkLocationCode) {
        return { success: false, error: `Salah lokasi bulk! Scan lokasi bulk (${params.scannedBulkLocationCode}) tidak sesuai tugas (${task.bulkLocationCode}).` };
    }
    if (task.pickingLocationCode !== params.scannedPickingLocationCode) {
        return { success: false, error: `Salah lokasi picking target! Scan lokasi (${params.scannedPickingLocationCode}) tidak sesuai tugas (${task.pickingLocationCode}).` };
    }
    task.status = 'COMPLETED';
    // Record Immutable Replenishment Transaction
    (0, transactionLedgerService_js_1.recordTransaction)({
        transactionType: 'REPLENISHMENT',
        sourceLocationCode: task.bulkLocationCode,
        destinationLocationCode: task.pickingLocationCode,
        materialCode: task.materialCode,
        midCode: task.midCode,
        quantity: task.quantity,
        uom: task.uom,
        operatorId: params.operatorId,
        operatorUsername: params.operatorUsername,
        referenceDocument: task.taskCode,
        reasonCode: 'MIN_MAX_BIN_REPLENISHMENT',
        correlationId: params.correlationId
    });
    return { success: true, task };
};
exports.confirmReplenishmentExecution = confirmReplenishmentExecution;
