"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeConflictResolution = exports.getSyncConflicts = exports.syncPdaQueue = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const syncService_js_1 = require("../services/syncService.js");
// Process Offline Queue & Detect SYNC_CONFLICT
const syncPdaQueue = (req, res) => {
    const { queueItems } = req.body;
    if (!Array.isArray(queueItems) || queueItems.length === 0) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'SYNC_EMPTY_QUEUE',
            message: 'Antrean sync PDA kosong.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, syncService_js_1.processOfflineSyncQueue)(queueItems, user.id, user.username, req.correlationId || 'corr-sync');
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Sinkronisasi PDA selesai. (${result.processedCount} diproses, ${result.conflictCount} konflik dideteksi).`,
        summary: result
    });
};
exports.syncPdaQueue = syncPdaQueue;
// Get List of SYNC_CONFLICT Records for Supervisor Review
const getSyncConflicts = (req, res) => {
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalConflicts: syncService_js_1.mockSyncConflicts.length,
        conflicts: syncService_js_1.mockSyncConflicts
    });
};
exports.getSyncConflicts = getSyncConflicts;
// Resolve SYNC_CONFLICT Entry
const executeConflictResolution = (req, res) => {
    const { conflictId, resolution } = req.body;
    if (!conflictId || !resolution) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'CONFLICT_INVALID_INPUT',
            message: 'ID Konflik dan jenis resolusi (ACCEPT_PDA / ACCEPT_SERVER) wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, syncService_js_1.resolveSyncConflict)(conflictId, resolution, user.id);
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'RESOLVE_FAILED',
            message: result.error || 'Gagal menyelesaikan konflik sync.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Konflik sync '${conflictId}' berhasil diselesaikan dengan resolusi '${resolution}'.`,
        conflict: result.conflict
    });
};
exports.executeConflictResolution = executeConflictResolution;
