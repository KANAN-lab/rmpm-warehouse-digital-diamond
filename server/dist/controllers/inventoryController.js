"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeStatusTransition = exports.getMidDetails = exports.getInventoryBalances = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const inventoryStateService_js_1 = require("../services/inventoryStateService.js");
// Search Current Inventory Balances API
const getInventoryBalances = (req, res) => {
    const { midCode, materialCode, batchNumber, palletCode, locationCode, status } = req.query;
    const items = (0, inventoryStateService_js_1.searchInventoryBalances)({
        midCode: midCode ? String(midCode) : undefined,
        materialCode: materialCode ? String(materialCode) : undefined,
        batchNumber: batchNumber ? String(batchNumber) : undefined,
        palletCode: palletCode ? String(palletCode) : undefined,
        locationCode: locationCode ? String(locationCode) : undefined,
        status: status ? String(status) : undefined
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalItems: items.length,
        balances: items
    });
};
exports.getInventoryBalances = getInventoryBalances;
// Lookup Specific MID Details
const getMidDetails = (req, res) => {
    const { midCode } = req.params;
    const item = inventoryStateService_js_1.mockInventoryBalances.find(b => b.midCode === midCode);
    if (!item) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'MID_NOT_FOUND',
            message: `Tag MID '${midCode}' tidak ditemukan di sistem inventaris.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        mid: item
    });
};
exports.getMidDetails = getMidDetails;
// Transition Inventory Status via State Machine
const executeStatusTransition = (req, res) => {
    const { midCode, targetStatus, reasonCode } = req.body;
    if (!midCode || !targetStatus || !reasonCode) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'TRANSITION_INVALID_INPUT',
            message: 'Kode MID, target status, dan reason code wajib diisi.',
            statusCode: 400
        });
    }
    const result = (0, inventoryStateService_js_1.transitionInventoryStatus)(midCode, targetStatus, reasonCode);
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'INVALID_STATUS_TRANSITION',
            message: result.error || 'Gagal mengubah status inventaris.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Status MID '${midCode}' berhasil diubah menjadi '${targetStatus}'.`,
        inventory: result.item
    });
};
exports.executeStatusTransition = executeStatusTransition;
