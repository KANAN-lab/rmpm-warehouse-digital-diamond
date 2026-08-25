"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPutaway = exports.getPutawaySuggestion = exports.inspectQuality = exports.receiveInbound = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const receivingPutawayService_js_1 = require("../services/receivingPutawayService.js");
// Inbound PO / ASN Receiving at Dock API
const receiveInbound = (req, res) => {
    const { poNumber, materialCode, materialName, batchNumber, quantity, uom, manufactureDate, expiryDate } = req.body;
    if (!poNumber || !materialCode || !batchNumber || !quantity || !uom) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'RECEIVING_INVALID_INPUT',
            message: 'Nomor PO, material code, batch number, kuantitas, dan UOM wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, receivingPutawayService_js_1.receiveInboundShipment)({
        poNumber,
        materialCode,
        materialName: materialName || materialCode,
        batchNumber,
        quantity: Number(quantity),
        uom,
        manufactureDate,
        expiryDate,
        operatorId: user.id,
        operatorUsername: user.username,
        correlationId: req.correlationId || 'corr-receiving'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Penerimaan fisik Inbound PO '${poNumber}' berhasil dicatat di Inbound Dock. Tag MID baru: '${result.midCode}'.`,
        midCode: result.midCode,
        inventory: result.inventory,
        transaction: result.transaction
    }, 201);
};
exports.receiveInbound = receiveInbound;
// Quality Control Inspection API
const inspectQuality = (req, res) => {
    const { midCode, result, notes } = req.body;
    if (!midCode || !result) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'QC_INVALID_INPUT',
            message: 'MID code dan hasil QC (PASSED / REJECTED) wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const qcResult = (0, receivingPutawayService_js_1.executeQualityInspection)({
        midCode,
        result,
        inspectorUserId: user.id,
        inspectorUsername: user.username,
        notes,
        correlationId: req.correlationId || 'corr-qc'
    });
    if (!qcResult.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'QC_INSPECTION_FAILED',
            message: qcResult.error || 'Gagal memperbarui status QC.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Inspeksi QC untuk MID '${midCode}' selesai dengan hasil '${result}'. Status inventaris kini '${qcResult.item?.status}'.`,
        inventory: qcResult.item
    });
};
exports.inspectQuality = inspectQuality;
// Get Putaway Bin Suggestion API
const getPutawaySuggestion = (req, res) => {
    const { midCode } = req.params;
    const suggestion = (0, receivingPutawayService_js_1.generatePutawaySuggestion)(midCode);
    if (!suggestion) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'MID_NOT_FOUND',
            message: `Tag MID '${midCode}' tidak ditemukan di sistem.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, suggestion);
};
exports.getPutawaySuggestion = getPutawaySuggestion;
// Confirm PDA Putaway Execution API
const confirmPutaway = (req, res) => {
    const { midCode, scannedBinCode } = req.body;
    if (!midCode || !scannedBinCode) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PUTAWAY_INVALID_INPUT',
            message: 'MID code dan scanned bin code wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, receivingPutawayService_js_1.confirmPutawayExecution)({
        midCode,
        scannedBinCode,
        operatorId: user.id,
        operatorUsername: user.username,
        correlationId: req.correlationId || 'corr-putaway'
    });
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PUTAWAY_EXECUTION_FAILED',
            message: result.error || 'Gagal mengeksekusi putaway.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Putaway MID '${midCode}' ke bin '${scannedBinCode}' berhasil dicatat ke ledger imutabel.`,
        transaction: result.transaction,
        updatedBalance: result.updatedBalance
    });
};
exports.confirmPutaway = confirmPutaway;
