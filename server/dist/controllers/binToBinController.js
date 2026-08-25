"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferBinToBin = exports.checkBinToBinValidation = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const binToBinService_js_1 = require("../services/binToBinService.js");
// Validate Bin-to-Bin Destination Capacity & Compatibility API
const checkBinToBinValidation = (req, res) => {
    const { sourceLocationCode, destinationLocationCode, midCode, quantity } = req.body;
    if (!sourceLocationCode || !destinationLocationCode || !midCode || !quantity) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'VALIDATE_B2B_INVALID_INPUT',
            message: 'Lokasi asal, lokasi tujuan, MID code, dan kuantitas wajib diisi.',
            statusCode: 400
        });
    }
    const validation = (0, binToBinService_js_1.validateBinToBinTransfer)(sourceLocationCode, destinationLocationCode, midCode, Number(quantity));
    if (!validation.isValid) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'DESTINATION_BIN_INCOMPATIBLE',
            message: validation.reason || 'Bin tujuan tidak kompatibel atau kapasitas terlampaui.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        isValid: true,
        message: `Bin tujuan '${destinationLocationCode}' valid dan siap menerima pemindahan barang dari '${sourceLocationCode}'.`
    });
};
exports.checkBinToBinValidation = checkBinToBinValidation;
// Execute Bin-to-Bin Transfer API
const transferBinToBin = (req, res) => {
    const { sourceLocationCode, destinationLocationCode, midCode, quantity, reasonCode } = req.body;
    if (!sourceLocationCode || !destinationLocationCode || !midCode || !quantity) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'B2B_INVALID_INPUT',
            message: 'Lokasi asal, lokasi tujuan, MID code, dan kuantitas wajib diisi.',
            statusCode: 400
        });
    }
    const user = req.user;
    const result = (0, binToBinService_js_1.executeBinToBinTransfer)({
        sourceLocationCode,
        destinationLocationCode,
        midCode,
        quantity: Number(quantity),
        reasonCode: reasonCode || 'REGULAR_SLOT_RELOCATION',
        operatorId: user.id,
        operatorUsername: user.username,
        correlationId: req.correlationId || 'corr-b2b'
    });
    if (!result.success) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'B2B_TRANSFER_FAILED',
            message: result.error || 'Gagal memindahkan barang ke bin tujuan.',
            statusCode: 400
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: `Perpindahan Bin-to-Bin dari '${sourceLocationCode}' ke '${destinationLocationCode}' berhasil dicatat ke ledger imutabel.`,
        transaction: result.transaction,
        updatedBalance: result.updatedBalance
    });
};
exports.transferBinToBin = transferBinToBin;
