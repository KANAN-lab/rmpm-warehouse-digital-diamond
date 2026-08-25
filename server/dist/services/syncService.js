"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSyncConflict = exports.processOfflineSyncQueue = exports.mockSyncConflicts = void 0;
const uuid_1 = require("uuid");
const blindCycleCountService_js_1 = require("./blindCycleCountService.js");
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const eventBus_js_1 = require("./eventBus.js");
exports.mockSyncConflicts = [];
const processOfflineSyncQueue = (items, userId, username, correlationId) => {
    const processed = [];
    const conflicts = [];
    for (const item of items) {
        const currentBalance = inventoryStateService_js_1.mockInventoryBalances.find(b => b.locationCode === item.locationCode);
        // Conflict check: If server state changed significantly after PDA offline timestamp
        if (currentBalance && currentBalance.lastMovementAt > item.timestamp) {
            const conflictRecord = {
                conflictId: `conflict-${(0, uuid_1.v4)().substring(0, 8)}`,
                cycleCountId: item.cycleCountId,
                locationCode: item.locationCode,
                scannedCode: item.scannedCode,
                pdaReportedQty: item.physicalQty,
                serverStateQty: currentBalance.quantity,
                pdaTimestamp: item.timestamp,
                status: 'PENDING_REVIEW'
            };
            exports.mockSyncConflicts.push(conflictRecord);
            conflicts.push(conflictRecord);
            eventBus_js_1.eventBus.publish('SyncConflictDetected', conflictRecord, correlationId);
        }
        else {
            // Record physical count entry cleanly
            (0, blindCycleCountService_js_1.recordBlindPhysicalCount)({
                cycleCountId: item.cycleCountId,
                targetId: item.targetId,
                locationCode: item.locationCode,
                scannedCode: item.scannedCode,
                physicalQty: item.physicalQty,
                uom: item.uom,
                isLocationEmpty: item.physicalQty === 0,
                counterUserId: userId,
                counterUsername: username,
                inputMode: item.inputMode,
                correlationId
            });
            processed.push(item.id);
        }
    }
    return {
        processedCount: processed.length,
        conflictCount: conflicts.length,
        processedIds: processed,
        conflicts
    };
};
exports.processOfflineSyncQueue = processOfflineSyncQueue;
const resolveSyncConflict = (conflictId, resolution, supervisorUserId) => {
    const conflict = exports.mockSyncConflicts.find(c => c.conflictId === conflictId);
    if (!conflict)
        return { success: false, error: 'Konflik sync tidak ditemukan.' };
    conflict.status = resolution === 'ACCEPT_PDA' ? 'RESOLVED_ACCEPT_PDA' : 'RESOLVED_ACCEPT_SERVER';
    conflict.resolvedBy = supervisorUserId;
    conflict.resolvedAt = new Date().toISOString();
    return { success: true, conflict };
};
exports.resolveSyncConflict = resolveSyncConflict;
