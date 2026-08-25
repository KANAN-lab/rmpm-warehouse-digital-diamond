"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPicking = exports.getPickListDetails = exports.createPickList = exports.allocateStockPreview = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const pickingService_js_1 = require("../services/pickingService.js");
// Auto-Allocation Preview API (FIFO / FEFO)
const allocateStockPreview = (req, res) => {
    const { materialCode, requestedQty, strategy = 'FEFO' } = req.body;
    if (!materialCode || !requestedQty) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'ALLOCATE_INVALID_INPUT',
            message: 'Material code dan requested quantity wajib diisi.',
            statusCode: 400
        });
    }
    const result = (0, pickingService_js_1.allocateStockForPicking)(materialCode, Number(requestedQty), strategy);
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        materialCode,
        requestedQty: Number(requestedQty),
        strategy,
        allocatedCount: result.allocatedItems.length,
        unfulfilledQty: result.unfulfilledQty,
        allocatedItems: result.allocatedItems
    });
};
exports.allocateStockPreview = allocateStockPreview;
// Create Pick List & Route Optimization API
const createPickList = (req, res) => {
    const { materialCode, requestedQty, strategy = 'FEFO' } = req.body;
    if (!materialCode || !requestedQty) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PICKLIST_INVALID_INPUT',
            message: 'Material code dan requested quantity wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const pickList = (0, pickingService_js_1.createPickListWithRoute)({
        materialCode,
        requestedQty: Number(requestedQty),
        strategy: strategy,
        createdBy: user.id,
        correlationId: req.correlationId || 'corr-picklist'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Pick List '${pickList.pickListCode}' berhasil dibuat dengan rute pengambilan optimum.`,
        pickList
    }, 201);
};
exports.createPickList = createPickList;
// Get Pick List Details
const getPickListDetails = (req, res) => {
    const { pickListId } = req.params;
    const pickList = pickingService_js_1.mockPickLists.find(p => p.pickListId === pickListId || p.pickListCode === pickListId);
    if (!pickList) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PICKLIST_NOT_FOUND',
            message: `Pick List '${pickListId}' tidak ditemukan.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, pickList);
};
exports.getPickListDetails = getPickListDetails;
// Confirm PDA Picking & Shortage Handling API
const confirmPicking = (req, res) => {
    const { pickListId, taskId, scannedLocationCode, scannedMidCode, actualPickedQty } = req.body;
    if (!pickListId || !taskId || !scannedLocationCode || !scannedMidCode || actualPickedQty === undefined) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'CONFIRM_PICK_INVALID_INPUT',
            message: 'ID Picklist, Task ID, scanned location, scanned MID, dan actual picked qty wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, pickingService_js_1.confirmPickingExecution)({
        pickListId,
        taskId,
        scannedLocationCode,
        scannedMidCode,
        actualPickedQty: Number(actualPickedQty),
        operatorId: user.id,
        operatorUsername: user.username,
        correlationId: req.correlationId || 'corr-confirm-pick'
    });
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PICK_EXECUTION_FAILED',
            message: result.error || 'Gagal mengonfirmasi pengambilan barang.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: 'Eksekusi pengambilan barang berhasil dicatat ke ledger imutabel.',
        task: result.task
    });
};
exports.confirmPicking = confirmPicking;
