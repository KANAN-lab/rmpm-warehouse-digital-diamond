"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const designerController_js_1 = require("../controllers/designerController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/generate-rack', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('layout.edit'), designerController_js_1.generateParametricRackApi);
router.post('/publish-version', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('layout.edit'), designerController_js_1.publishLayoutVersionApi);
exports.default = router;
