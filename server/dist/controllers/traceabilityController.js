"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveExceptions = exports.getTraceabilityGraph = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const traceabilityExceptionService_js_1 = require("../services/traceabilityExceptionService.js");
// Get End-to-End Traceability Node Graph API
const getTraceabilityGraph = (req, res) => {
    const { midCode } = req.params;
    const graph = (0, traceabilityExceptionService_js_1.getMaterialTraceabilityGraph)(midCode);
    if (!graph) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'TRACEABILITY_NOT_FOUND',
            message: `Data jejak pergerakan untuk MID '${midCode}' tidak ditemukan di ledger.`,
            statusCode: 404
        });
    }
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, graph);
};
exports.getTraceabilityGraph = getTraceabilityGraph;
// Get List of Active Warehouse Exceptions API
const getActiveExceptions = (req, res) => {
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalExceptions: traceabilityExceptionService_js_1.mockExceptions.length,
        exceptions: traceabilityExceptionService_js_1.mockExceptions
    });
};
exports.getActiveExceptions = getActiveExceptions;
