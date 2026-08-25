import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from './correlationId.js';
import { sendOperationalError } from '../utils/errorResponder.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rmpm-warehouse-digital-twin-secret-key-2026';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
  departmentId?: string;
  deviceId?: string;
  macAddress?: string;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendOperationalError(req, res, {
      code: 'AUTH_TOKEN_MISSING',
      message: 'Sesi otentikasi tidak ditemukan. Silakan login kembali pada perangkat Anda.',
      statusCode: 401
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
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
  } catch (error) {
    return sendOperationalError(req, res, {
      code: 'AUTH_TOKEN_INVALID',
      message: 'Sesi login Anda telah kedaluwarsa atau tidak valid. Silakan login ulang.',
      statusCode: 401
    });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendOperationalError(req, res, {
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Pengguna tidak terautentikasi.',
        statusCode: 401
      });
    }

    const { role, permissions } = req.user;
    if (role === 'ADMIN' || permissions.includes(requiredPermission)) {
      return next();
    }

    return sendOperationalError(req, res, {
      code: 'PERMISSION_DENIED',
      message: `Akses ditolak. Peran Anda (${role}) tidak memiliki izin '${requiredPermission}'.`,
      statusCode: 403,
      details: { required_permission: requiredPermission, user_role: role }
    });
  };
};

export const createToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};
