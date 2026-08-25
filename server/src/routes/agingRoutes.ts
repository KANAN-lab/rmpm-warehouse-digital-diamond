import { Router } from 'express';
import { getAgingSummary, getExpiryAlertList } from '../controllers/agingController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticateJwt, getAgingSummary);
router.get('/expiry-alerts', authenticateJwt, getExpiryAlertList);

export default router;
