"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agingController_js_1 = require("../controllers/agingController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/summary', auth_js_1.authenticateJwt, agingController_js_1.getAgingSummary);
router.get('/expiry-alerts', auth_js_1.authenticateJwt, agingController_js_1.getExpiryAlertList);
exports.default = router;
