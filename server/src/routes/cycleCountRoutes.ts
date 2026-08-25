import { Router } from 'express';
import { 
  createOrder, 
  getBlindTask, 
  recordPhysicalEntry, 
  getReconciliationReport, 
  requestRecount 
} from '../controllers/cycleCountController.js';
import { authenticateJwt, requirePermission } from '../middleware/auth.js';

const router = Router();

router.post('/orders', authenticateJwt, requirePermission('cycle_count.create'), createOrder);
router.get('/blind-task/:taskId', authenticateJwt, getBlindTask);
router.post('/entries', authenticateJwt, requirePermission('cycle_count.count'), recordPhysicalEntry);
router.get('/reconciliation/:orderId', authenticateJwt, requirePermission('cycle_count.view_variance'), getReconciliationReport);
router.post('/recount', authenticateJwt, requirePermission('cycle_count.create'), requestRecount);

export default router;
