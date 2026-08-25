"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBinToBinTransfer = exports.validateBinToBinTransfer = void 0;
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const locationHierarchyService_js_1 = require("./locationHierarchyService.js");
const transactionLedgerService_js_1 = require("./transactionLedgerService.js");
const eventBus_js_1 = require("./eventBus.js");
// 1. Validate Material-Location Compatibility & Destination Capacity
const validateBinToBinTransfer = (sourceLocationCode, destinationLocationCode, midCode, quantity) => {
    const item = inventoryStateService_js_1.mockInventoryBalances.find(b => b.midCode === midCode && b.locationCode === sourceLocationCode);
    if (!item) {
        return {
            isValid: false,
            reason: `Stok dengan MID '${midCode}' tidak ditemukan di lokasi asal '${sourceLocationCode}'.`
        };
    }
    if (item.quantity < quantity) {
        return {
            isValid: false,
            reason: `Kuantitas stok tidak mencukupi! (Tersedia: ${item.quantity} ${item.uom}, Diminta: ${quantity} ${item.uom}).`
        };
    }
    const targetNode = (0, locationHierarchyService_js_1.findLocationNode)(locationHierarchyService_js_1.mockLocationTree, destinationLocationCode);
    if (targetNode) {
        const capacityCheck = (0, locationHierarchyService_js_1.validateLocationCapacity)(targetNode, quantity * 1.5, 2.0, 1);
        if (!capacityCheck.isValid) {
            return capacityCheck;
        }
    }
    return { isValid: true };
};
exports.validateBinToBinTransfer = validateBinToBinTransfer;
// 2. Execute Bin-to-Bin Transfer & Log Immutable Transaction
const executeBinToBinTransfer = (req) => {
    const validation = (0, exports.validateBinToBinTransfer)(req.sourceLocationCode, req.destinationLocationCode, req.midCode, req.quantity);
    if (!validation.isValid) {
        return { success: false, error: validation.reason };
    }
    const item = inventoryStateService_js_1.mockInventoryBalances.find(b => b.midCode === req.midCode && b.locationCode === req.sourceLocationCode);
    if (!item) {
        return { success: false, error: 'Stok tidak ditemukan.' };
    }
    // Update current stock location atomicly
    const oldLoc = item.locationCode;
    item.locationCode = req.destinationLocationCode;
    item.lastMovementAt = new Date().toISOString();
    // Record Immutable BIN_TO_BIN Transaction
    const transaction = (0, transactionLedgerService_js_1.recordTransaction)({
        transactionType: 'BIN_TO_BIN',
        sourceLocationCode: oldLoc,
        destinationLocationCode: req.destinationLocationCode,
        materialCode: item.materialCode,
        batchNumber: item.batchNumber,
        midCode: item.midCode,
        palletCode: item.palletCode,
        quantity: req.quantity,
        uom: item.uom,
        operatorId: req.operatorId,
        operatorUsername: req.operatorUsername,
        reasonCode: req.reasonCode || 'SLOT_OPTIMIZATION_TRANSFER',
        correlationId: req.correlationId
    });
    eventBus_js_1.eventBus.publish('InventoryMoved', { midCode: req.midCode, from: oldLoc, to: req.destinationLocationCode }, req.correlationId);
    return { success: true, transaction, updatedBalance: item };
};
exports.executeBinToBinTransfer = executeBinToBinTransfer;
