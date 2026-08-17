import { Router } from 'express';
import { createService, deleteService, getAllServices, getService, updateService } from '../controllers/serviceController';
import { requireRole, validateToken } from '../middleware/auth';

const router = Router();
router.use(validateToken);
router.get('/', getAllServices);
router.get('/:id', getService);
router.post('/', requireRole(1), createService);
router.put('/:id', requireRole(1), updateService);
router.delete('/:id', requireRole(1), deleteService);
export default router;
