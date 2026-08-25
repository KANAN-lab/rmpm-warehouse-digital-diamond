import { Router } from 'express';
import { 
  checkReplenishmentTriggers, 
  getReplenishmentTasks, 
  confirmReplenishment 
} from '../controllers/replenishmentController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/check-triggers', authenticateJwt, checkReplenishmentTriggers);
router.get('/tasks', authenticateJwt, getReplenishmentTasks);
router.post('/confirm', authenticateJwt, confirmReplenishment);

export default router;
