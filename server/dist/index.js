"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const correlationId_js_1 = require("./middleware/correlationId.js");
const logger_js_1 = require("./utils/logger.js");
const errorResponder_js_1 = require("./utils/errorResponder.js");
const auth_js_1 = require("./middleware/auth.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(correlationId_js_1.correlationIdMiddleware);
// Request logging middleware
app.use((req, res, next) => {
    logger_js_1.logger.info(`HTTP ${req.method} ${req.url}`, {
        correlation_id: req.correlationId,
        ip: req.ip,
        user_agent: req.header('user-agent')
    });
    next();
});
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        service: 'RMPM Warehouse Digital Twin Server',
        status: 'ONLINE',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Mock Auth Login Endpoint for Seed Users
app.post('/api/v1/auth/login', (req, res) => {
    const { username, password, deviceCode } = req.body;
    if (!username || !password) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'AUTH_INVALID_INPUT',
            message: 'Username dan password wajib diisi.',
            statusCode: 400
        });
    }
    // Pre-configured Enterprise Seed Users for Verification
    const seedUsers = {
        admin: {
            id: 'usr-admin-001',
            role: 'ADMIN',
            permissions: ['*']
        },
        supervisor: {
            id: 'usr-supervisor-001',
            role: 'SUPERVISOR',
            permissions: ['cycle_count.create', 'cycle_count.view_variance', 'cycle_count.approve', 'layout.edit']
        },
        counter01: {
            id: 'usr-counter-001',
            role: 'COUNTER',
            permissions: ['cycle_count.count']
        }
    };
    const user = seedUsers[username.toLowerCase()];
    if (!user) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'AUTH_USER_NOT_FOUND',
            message: 'Pengguna tidak ditemukan atau password salah.',
            statusCode: 401
        });
    }
    const token = (0, auth_js_1.createToken)({
        userId: user.id,
        username,
        role: user.role,
        permissions: user.permissions,
        deviceId: deviceCode || 'DEV-WEB-BROWSER',
        macAddress: 'AA:BB:CC:DD:EE:FF'
    });
    return (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        token,
        user: {
            id: user.id,
            username,
            role: user.role,
            permissions: user.permissions
        }
    });
});
const masterDataRoutes_js_1 = __importDefault(require("./routes/masterDataRoutes.js"));
const locationRoutes_js_1 = __importDefault(require("./routes/locationRoutes.js"));
const inventoryRoutes_js_1 = __importDefault(require("./routes/inventoryRoutes.js"));
const transactionRoutes_js_1 = __importDefault(require("./routes/transactionRoutes.js"));
const cycleCountRoutes_js_1 = __importDefault(require("./routes/cycleCountRoutes.js"));
const syncRoutes_js_1 = __importDefault(require("./routes/syncRoutes.js"));
const layout3dRoutes_js_1 = __importDefault(require("./routes/layout3dRoutes.js"));
const designerRoutes_js_1 = __importDefault(require("./routes/designerRoutes.js"));
const pickingRoutes_js_1 = __importDefault(require("./routes/pickingRoutes.js"));
// Master Data Routes
app.use('/api/v1/master-data', masterDataRoutes_js_1.default);
// Location Hierarchy Routes
app.use('/api/v1/locations', locationRoutes_js_1.default);
// Inventory Engine Routes
app.use('/api/v1/inventory', inventoryRoutes_js_1.default);
// Immutable Transaction Ledger Routes
app.use('/api/v1/transactions', transactionRoutes_js_1.default);
// Blind Cycle Count Engine Routes
app.use('/api/v1/cycle-count', cycleCountRoutes_js_1.default);
// Offline PDA Sync Routes
app.use('/api/v1/sync', syncRoutes_js_1.default);
// 3D Digital Twin Layout Routes
app.use('/api/v1/3d', layout3dRoutes_js_1.default);
// 3D Layout Designer Routes
app.use('/api/v1/3d/designer', designerRoutes_js_1.default);
// Picking Engine Routes
app.use('/api/v1/picking', pickingRoutes_js_1.default);
// Protected Example Verification Endpoint
app.get('/api/v1/cycle-count/protected-test', auth_js_1.authenticateJwt, (0, auth_js_1.requirePermission)('cycle_count.create'), (req, res) => {
    (0, errorResponder_js_1.sendSuccessResponse)(req, res, {
        message: 'Akses disetujui untuk operasi pembuatan Cycle Count.',
        user: req.user
    });
});
// 404 Route Handler
app.use((req, res) => {
    (0, errorResponder_js_1.sendOperationalError)(req, res, {
        code: 'RESOURCE_NOT_FOUND',
        message: `Endpoint API '${req.method} ${req.url}' tidak ditemukan pada server WMS.`,
        statusCode: 404
    });
});
app.listen(PORT, () => {
    logger_js_1.logger.info(`RMPM WMS Backend Server berjalan di port ${PORT}`);
});
