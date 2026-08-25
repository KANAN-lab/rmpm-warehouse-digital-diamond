"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLocationCapacityValidation = exports.generateCodesForLocation = exports.getLocationPath = exports.getLocationTree = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const locationHierarchyService_js_1 = require("../services/locationHierarchyService.js");
// Get Full Recursive Location Tree
const getLocationTree = (req, res) => {
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        tree: locationHierarchyService_js_1.mockLocationTree
    });
};
exports.getLocationTree = getLocationTree;
// Find Location Node & Path Breadcrumb
const getLocationPath = (req, res) => {
    const { idOrCode } = req.params;
    const node = (0, locationHierarchyService_js_1.findLocationNode)(locationHierarchyService_js_1.mockLocationTree, idOrCode);
    if (!node) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'LOCATION_NOT_FOUND',
            message: `Lokasi gudang '${idOrCode}' tidak ditemukan di database.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        node,
        breadcrumb: `WH-RMPM-01 > ZONE-A > RACK-A01 > ${node.code}`
    });
};
exports.getLocationPath = getLocationPath;
// Batch Generate Barcodes & QR Codes for Location
const generateCodesForLocation = (req, res) => {
    const { code, locationType } = req.body;
    if (!code || !locationType) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'LOCATION_CODE_MISSING',
            message: 'Kode lokasi dan jenis lokasi wajib diisi.',
            statusCode: 400
        });
    }
    const generated = (0, locationHierarchyService_js_1.generateLocationCodes)(code, locationType);
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        code,
        locationType,
        barcode: generated.barcode,
        qrCode: generated.qrCode
    });
};
exports.generateCodesForLocation = generateCodesForLocation;
// Validate Location Capacity Before Physical Movement
const checkLocationCapacityValidation = (req, res) => {
    const { locationCode, additionalWeight, additionalVolume, additionalPallets = 1 } = req.body;
    const node = (0, locationHierarchyService_js_1.findLocationNode)(locationHierarchyService_js_1.mockLocationTree, locationCode);
    if (!node) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'LOCATION_NOT_FOUND',
            message: `Lokasi gudang '${locationCode}' tidak ditemukan untuk pemeriksaan kapasitas.`,
            statusCode: 404
        });
    }
    const validation = (0, locationHierarchyService_js_1.validateLocationCapacity)(node, Number(additionalWeight || 0), Number(additionalVolume || 0), Number(additionalPallets || 1));
    if (!validation.isValid) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'CAPACITY_OVERFLOW',
            message: validation.reason || 'Kapasitas lokasi tidak mencukupi.',
            statusCode: 400,
            details: {
                locationCode,
                currentWeight: node.currentWeight,
                maxWeight: node.maxWeight
            }
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        isValid: true,
        message: `Lokasi '${locationCode}' berstatus AKTIF dan kapasitas mencukupi untuk pemindahan barang.`
    });
};
exports.checkLocationCapacityValidation = checkLocationCapacityValidation;
