import { Router } from 'express';
import { createBatch, updateBatchStatus, getBatches } from '../controllers/batchingController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/create', authenticateJwt, createBatch);
router.post('/transition-status', authenticateJwt, updateBatchStatus);
router.get('/batches', authenticateJwt, getBatches);

export default router;
