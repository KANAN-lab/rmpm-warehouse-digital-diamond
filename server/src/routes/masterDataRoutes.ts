import { Router } from 'express';
import { 
  listMasterData, 
  createMasterData, 
  softDeleteMasterData, 
  validateImportData 
} from '../controllers/masterDataController.js';
import { authenticateJwt, requirePermission } from '../middleware/auth.js';

const router = Router();

// Public Read / Protected CRUD Endpoints
router.get('/', authenticateJwt, listMasterData);
router.post('/', authenticateJwt, requirePermission('master_data.edit'), createMasterData);
router.patch('/:id/status', authenticateJwt, requirePermission('master_data.edit'), softDeleteMasterData);
router.post('/import-validate', authenticateJwt, requirePermission('master_data.edit'), validateImportData);

export default router;
