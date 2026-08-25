"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiryAlertList = exports.getAgingSummary = void 0;
const errorResponder_js_1 = require("../utils/errorResponder.js");
const agingEngineService_js_1 = require("../services/agingEngineService.js");
// Get Dynamic Aging Buckets Breakdown API
const getAgingSummary = (req, res) => {
    const report = (0, agingEngineService_js_1.getAgingSummaryReport)();
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, report);
};
exports.getAgingSummary = getAgingSummary;
// Get Expiry Alerts List API
const getExpiryAlertList = (req, res) => {
    const alerts = (0, agingEngineService_js_1.getExpiryAlerts)();
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        totalAlerts: alerts.length,
        alerts
    });
};
exports.getExpiryAlertList = getExpiryAlertList;
