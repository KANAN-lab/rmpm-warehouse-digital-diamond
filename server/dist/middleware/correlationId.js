"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationIdMiddleware = void 0;
const uuid_1 = require("uuid");
const correlationIdMiddleware = (req, res, next) => {
    const incomingCorrelationId = req.header('X-Correlation-ID');
    const correlationId = incomingCorrelationId || `corr-${(0, uuid_1.v4)()}`;
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
};
exports.correlationIdMiddleware = correlationIdMiddleware;
