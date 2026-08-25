import { Router } from 'express';
import { getTraceabilityGraph, getActiveExceptions } from '../controllers/traceabilityController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/graph/:midCode', authenticateJwt, getTraceabilityGraph);
router.get('/exceptions', authenticateJwt, getActiveExceptions);

export default router;
