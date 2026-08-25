"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const masterDataController_js_1 = require("../controllers/masterDataController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public Read / Protected CRUD Endpoints
router.get('/', auth_js_1.authenticateJwt, masterDataController_js_1.listMasterData);
router.post('/', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('master_data.edit'), masterDataController_js_1.createMasterData);
router.patch('/:id/status', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('master_data.edit'), masterDataController_js_1.softDeleteMasterData);
router.post('/import-validate', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('master_data.edit'), masterDataController_js_1.validateImportData);
exports.default = router;
