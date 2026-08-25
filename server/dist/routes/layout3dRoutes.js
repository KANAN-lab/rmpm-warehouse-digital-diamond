"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const layout3dController_js_1 = require("../controllers/layout3dController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/active', auth_js_1.authenticateJwt, layout3dController_js_1.getActive3dLayout);
router.get('/heatmap', auth_js_1.authenticateJwt, layout3dController_js_1.get3dHeatmapData);
exports.default = router;
