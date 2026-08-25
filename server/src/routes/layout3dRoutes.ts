import { Router } from 'express';
import { getActive3dLayout, get3dHeatmapData } from '../controllers/layout3dController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/active', authenticateJwt, getActive3dLayout);
router.get('/heatmap', authenticateJwt, get3dHeatmapData);

export default router;
