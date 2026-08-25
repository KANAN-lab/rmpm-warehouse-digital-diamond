import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { correlationIdMiddleware, AuthenticatedRequest } from './middleware/correlationId.js';
import { logger } from './utils/logger.js';
import { sendSuccessResponse, sendOperationalError } from './utils/errorResponder.js';
import { createToken, authenticateJwt, requirePermission } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);

// Request logging middleware
app.use((req: AuthenticatedRequest, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`, {
    correlation_id: req.correlationId,
    ip: req.ip,
    user_agent: req.header('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/api/v1/health', (req: AuthenticatedRequest, res) => {
  sendSuccessResponse(req, res, {
    service: 'RMPM Warehouse Digital Twin Server',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mock Auth Login Endpoint for Seed Users
app.post('/api/v1/auth/login', (req: AuthenticatedRequest, res) => {
  const { username, password, deviceCode } = req.body;
  if (!username || !password) {
    return sendOperationalError(req, res, {
      code: 'AUTH_INVALID_INPUT',
      message: 'Username dan password wajib diisi.',
      statusCode: 400
    });
  }

  // Pre-configured Enterprise Seed Users for Verification
  const seedUsers: Record<string, { id: string; role: string; permissions: string[] }> = {
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
    return sendOperationalError(req, res, {
      code: 'AUTH_USER_NOT_FOUND',
      message: 'Pengguna tidak ditemukan atau password salah.',
      statusCode: 401
    });
  }

  const token = createToken({
    userId: user.id,
    username,
    role: user.role,
    permissions: user.permissions,
    deviceId: deviceCode || 'DEV-WEB-BROWSER',
    macAddress: 'AA:BB:CC:DD:EE:FF'
  });

  return sendSuccessResponse(req, res, {
    token,
    user: {
      id: user.id,
      username,
      role: user.role,
      permissions: user.permissions
    }
  });
});

import masterDataRoutes from './routes/masterDataRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

// Master Data Routes
app.use('/api/v1/master-data', masterDataRoutes);

// Location Hierarchy Routes
app.use('/api/v1/locations', locationRoutes);

// Protected Example Verification Endpoint
app.get('/api/v1/cycle-count/protected-test', authenticateJwt, requirePermission('cycle_count.create'), (req: AuthenticatedRequest, res) => {
  sendSuccessResponse(req, res, {
    message: 'Akses disetujui untuk operasi pembuatan Cycle Count.',
    user: req.user
  });
});

// 404 Route Handler
app.use((req: AuthenticatedRequest, res) => {
  sendOperationalError(req, res, {
    code: 'RESOURCE_NOT_FOUND',
    message: `Endpoint API '${req.method} ${req.url}' tidak ditemukan pada server WMS.`,
    statusCode: 404
  });
});

app.listen(PORT, () => {
  logger.info(`RMPM WMS Backend Server berjalan di port ${PORT}`);
});
