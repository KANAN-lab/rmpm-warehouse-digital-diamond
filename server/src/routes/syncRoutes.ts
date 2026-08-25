import { Router } from 'express';
import { 
  syncPdaQueue, 
  getSyncConflicts, 
  executeConflictResolution 
} from '../controllers/syncController.js';
import { authenticateJwt, requirePermission } from '../middleware/auth.js';

const router = Router();

router.post('/pda-queue', authenticateJwt, syncPdaQueue);
router.get('/conflicts', authenticateJwt, requirePermission('cycle_count.approve'), getSyncConflicts);
router.post('/resolve-conflict', authenticateJwt, requirePermission('cycle_count.approve'), executeConflictResolution);

export default router;
