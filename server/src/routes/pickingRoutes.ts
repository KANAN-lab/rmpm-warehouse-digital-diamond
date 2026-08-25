import { Router } from 'express';
import { 
  allocateStockPreview, 
  createPickList, 
  getPickListDetails, 
  confirmPicking 
} from '../controllers/pickingController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/allocate', authenticateJwt, allocateStockPreview);
router.post('/create-list', authenticateJwt, createPickList);
router.get('/list/:pickListId', authenticateJwt, getPickListDetails);
router.post('/confirm', authenticateJwt, confirmPicking);

export default router;
