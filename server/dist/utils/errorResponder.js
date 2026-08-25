"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccessResponse = exports.sendOperationalError = void 0;
const sendOperationalError = (req, res, options) => {
    const statusCode = options.statusCode || 400;
    return res.status(statusCode).json({
        success: false,
        error: {
            code: options.code,
            message: options.message,
            details: options.details || {}
        },
        timestamp: new Date().toISOString(),
        correlation_id: req.correlationId || 'corr-unknown'
    });
};
exports.sendOperationalError = sendOperationalError;
const sendSuccessResponse = (req, res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        correlation_id: req.correlationId || 'corr-unknown'
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
