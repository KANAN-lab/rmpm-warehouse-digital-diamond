import { Router } from 'express';
import { checkBinToBinValidation, transferBinToBin } from '../controllers/binToBinController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/validate', authenticateJwt, checkBinToBinValidation);
router.post('/transfer', authenticateJwt, transferBinToBin);

export default router;
