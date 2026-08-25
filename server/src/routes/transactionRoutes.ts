import { Router } from 'express';
import { 
  getTransactionHistory, 
  createTransaction, 
  revertTransaction 
} from '../controllers/transactionController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJwt, getTransactionHistory);
router.post('/', authenticateJwt, createTransaction);
router.post('/:id/revert', authenticateJwt, revertTransaction);

export default router;
