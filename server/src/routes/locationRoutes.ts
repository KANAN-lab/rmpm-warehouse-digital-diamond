import { Router } from 'express';
import { 
  getLocationTree, 
  getLocationPath, 
  generateCodesForLocation, 
  checkLocationCapacityValidation 
} from '../controllers/locationController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/tree', authenticateJwt, getLocationTree);
router.get('/path/:idOrCode', authenticateJwt, getLocationPath);
router.post('/generate-codes', authenticateJwt, generateCodesForLocation);
router.post('/validate-capacity', authenticateJwt, checkLocationCapacityValidation);

export default router;
