"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = exports.requirePermission = exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorResponder_js_1 = require("../utils/errorResponder.js");
const JWT_SECRET = process.env.JWT_SECRET || 'rmpm-warehouse-digital-twin-secret-key-2026';
const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Sesi otentikasi tidak ditemukan. Silakan login kembali pada perangkat Anda.',
            statusCode: 401
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            permissions: decoded.permissions || [],
            departmentId: decoded.departmentId
        };
        if (decoded.deviceId) {
            req.device = {
                id: decoded.deviceId,
                deviceCode: decoded.deviceId,
                macAddress: decoded.macAddress || 'UNKNOWN_MAC'
            };
        }
        next();
    }
    catch (error) {
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'AUTH_TOKEN_INVALID',
            message: 'Sesi login Anda telah kedaluwarsa atau tidak valid. Silakan login ulang.',
            statusCode: 401
        });
    }
};
exports.authenticateJwt = authenticateJwt;
const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, errorResponder_js_1.sendOperationalError)(req, res, {
                code: 'UNAUTHORIZED_ACCESS',
                message: 'Pengguna tidak terautentikasi.',
                statusCode: 401
            });
        }
        const { role, permissions } = req.user;
        if (role === 'ADMIN' || permissions.includes(requiredPermission)) {
            return next();
        }
        return (0, errorResponder_js_1.sendOperationalError)(req, res, {
            code: 'PERMISSION_DENIED',
            message: `Akses ditolak. Peran Anda (${role}) tidak memiliki izin '${requiredPermission}'.`,
            statusCode: 403,
            details: { required_permission: requiredPermission, user_role: role }
        });
    };
};
exports.requirePermission = requirePermission;
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};
exports.createToken = createToken;
