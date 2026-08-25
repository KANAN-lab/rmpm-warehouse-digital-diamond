"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const binToBinController_js_1 = require("../controllers/binToBinController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/validate', auth_js_1.authenticateJwt, binToBinController_js_1.checkBinToBinValidation);
router.post('/transfer', auth_js_1.authenticateJwt, binToBinController_js_1.transferBinToBin);
exports.default = router;
