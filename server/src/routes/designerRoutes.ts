import { Router } from 'express';
import { generateParametricRackApi, publishLayoutVersionApi } from '../controllers/designerController.js';
import { authenticateJwt, requirePermission } from '../middleware/auth.js';

const router = Router();

router.post('/generate-rack', authenticateJwt, requirePermission('layout.edit'), generateParametricRackApi);
router.post('/publish-version', authenticateJwt, requirePermission('layout.edit'), publishLayoutVersionApi);

export default router;
