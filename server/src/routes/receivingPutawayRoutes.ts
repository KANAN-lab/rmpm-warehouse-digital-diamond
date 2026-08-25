import { Router } from 'express';
import { 
  receiveInbound, 
  inspectQuality, 
  getPutawaySuggestion, 
  confirmPutaway 
} from '../controllers/receivingPutawayController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/receive', authenticateJwt, receiveInbound);
router.post('/qc-inspection', authenticateJwt, inspectQuality);
router.get('/putaway-suggestion/:midCode', authenticateJwt, getPutawaySuggestion);
router.post('/confirm-putaway', authenticateJwt, confirmPutaway);

export default router;
