"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRecount = exports.getReconciliationReport = exports.recordPhysicalEntry = exports.getBlindTask = exports.createOrder = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const blindCycleCountService_js_1 = require("../services/blindCycleCountService.js");
// Create Cycle Count Order in 11 Modes + Snapshot
const createOrder = (req, res) => {
    const { mode, targetCriteria } = req.body;
    if (!mode || !targetCriteria) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'SO_INVALID_INPUT',
            message: 'Mode hitung SO dan target kriteria wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const order = (0, blindCycleCountService_js_1.createCycleCountOrder)({
        mode: mode,
        targetCriteria,
        createdBy: user.id,
        correlationId: req.correlationId || 'corr-so-create'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Order Blind SO '${order.orderCode}' berhasil dibuat dalam Mode '${mode}'. Snapshot awal t_0 berhasil di-generate.`,
        order
    }, 201);
};
exports.createOrder = createOrder;
// Get Blind Counter Screen (MUTLAK: HIDING SYSTEM QTY)
const getBlindTask = (req, res) => {
    const { taskId } = req.params;
    const task = (0, blindCycleCountService_js_1.getBlindTaskForCounter)(taskId);
    if (!task) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'TASK_NOT_FOUND',
            message: `Tugas hitung SO '${taskId}' tidak ditemukan.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, task);
};
exports.getBlindTask = getBlindTask;
// Record Blind Physical Count Entry
const recordPhysicalEntry = (req, res) => {
    const { cycleCountId, targetId, locationCode, scannedCode, batchNumber, physicalQty, uom, isLocationEmpty, inputMode, counterAttempt } = req.body;
    if (!cycleCountId || !locationCode || (!scannedCode && !isLocationEmpty)) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'ENTRY_INVALID_INPUT',
            message: 'ID SO, kode lokasi, dan scanned code (atau flag empty) wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const entry = (0, blindCycleCountService_js_1.recordBlindPhysicalCount)({
        cycleCountId,
        targetId: targetId || `tgt-${Date.now()}`,
        locationCode,
        scannedCode: scannedCode || 'LOCATION_EMPTY',
        batchNumber,
        physicalQty: Number(physicalQty || 0),
        uom: uom || 'KG',
        isLocationEmpty: Boolean(isLocationEmpty),
        counterUserId: user.id,
        counterUsername: user.username,
        inputMode: inputMode || 'SCAN',
        counterAttempt: counterAttempt || 'COUNT_A',
        correlationId: req.correlationId || 'corr-entry'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: 'Hasil hitung fisik blind berhasil disimpan secara imutabel.',
        entry
    }, 201);
};
exports.recordPhysicalEntry = recordPhysicalEntry;
// Get Dynamic Reconciliation (Supervisor Only)
const getReconciliationReport = (req, res) => {
    const { orderId } = req.params;
    const report = (0, blindCycleCountService_js_1.calculateDynamicReconciliation)(orderId);
    if (!report) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'RECONCILIATION_NOT_FOUND',
            message: `Laporan rekonsiliasi untuk SO ID '${orderId}' tidak ditemukan.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, report);
};
exports.getReconciliationReport = getReconciliationReport;
// Assign Independent Recount Counter B
const requestRecount = (req, res) => {
    const { orderId, targetId, counterBUserId } = req.body;
    if (!orderId || !targetId || !counterBUserId) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'RECOUNT_INVALID_INPUT',
            message: 'ID Order, Target ID, dan User ID Counter B wajib diisi.',
            statusCode: 400
        });
    }
    const result = (0, blindCycleCountService_js_1.assignIndependentRecount)(orderId, targetId, counterBUserId, req.correlationId || 'corr-recount');
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'RECOUNT_FAILED',
            message: result.error || 'Gagal mengalokasikan recount.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: result.message
    });
};
exports.requestRecount = requestRecount;
