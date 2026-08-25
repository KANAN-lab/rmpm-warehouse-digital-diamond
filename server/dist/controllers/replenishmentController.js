"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmReplenishment = exports.getReplenishmentTasks = exports.checkReplenishmentTriggers = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const replenishmentService_js_1 = require("../services/replenishmentService.js");
// Trigger Min/Max Scan & Auto-Create Tasks API
const checkReplenishmentTriggers = (req, res) => {
    const user = req.user;
    const generatedTasks = (0, replenishmentService_js_1.evaluateReplenishmentTriggers)(user.id, req.correlationId || 'corr-replenish-scan');
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Pemeriksaan pemicu Min/Max replenishment selesai. (${generatedTasks.length} tugas baru dibuat).`,
        generatedTasks
    });
};
exports.checkReplenishmentTriggers = checkReplenishmentTriggers;
// List Pending Replenishment Tasks API
const getReplenishmentTasks = (req, res) => {
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalTasks: replenishmentService_js_1.mockReplenishmentTasks.length,
        tasks: replenishmentService_js_1.mockReplenishmentTasks
    });
};
exports.getReplenishmentTasks = getReplenishmentTasks;
// Confirm PDA Replenishment Execution API
const confirmReplenishment = (req, res) => {
    const { taskId, scannedBulkLocationCode, scannedPickingLocationCode, scannedMidCode } = req.body;
    if (!taskId || !scannedBulkLocationCode || !scannedPickingLocationCode || !scannedMidCode) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'REPL_CONFIRM_INVALID_INPUT',
            message: 'ID Tugas, lokasi bulk, lokasi picking, dan MID code wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, replenishmentService_js_1.confirmReplenishmentExecution)({
        taskId,
        scannedBulkLocationCode,
        scannedPickingLocationCode,
        scannedMidCode,
        operatorId: user.id,
        operatorUsername: user.username,
        correlationId: req.correlationId || 'corr-confirm-replenish'
    });
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'REPL_EXECUTION_FAILED',
            message: result.error || 'Gagal mengonfirmasi pemindahan replenishment.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Pemindahan replenishment untuk tugas '${taskId}' berhasil dicatat ke ledger imutabel.`,
        task: result.task
    });
};
exports.confirmReplenishment = confirmReplenishment;
