import { Router } from 'express';
import { 
  getInventoryBalances, 
  getMidDetails, 
  executeStatusTransition 
} from '../controllers/inventoryController.js';
import { authenticateJwt, requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/search', authenticateJwt, getInventoryBalances);
router.get('/mid/:midCode', authenticateJwt, getMidDetails);
router.post('/transition-status', authenticateJwt, requirePermission('master_data.edit'), executeStatusTransition);

export default router;
