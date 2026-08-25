"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const traceabilityController_js_1 = require("../controllers/traceabilityController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/graph/:midCode', auth_js_1.authenticateJwt, traceabilityController_js_1.getTraceabilityGraph);
router.get('/exceptions', auth_js_1.authenticateJwt, traceabilityController_js_1.getActiveExceptions);
exports.default = router;
