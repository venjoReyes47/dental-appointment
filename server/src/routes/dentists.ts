import { Router } from 'express';
import { createDentist, deleteDentist, getAllDentists, getDentistById, updateDentist } from '../controllers/dentistController';
import { requireRole, validateToken } from '../middleware/auth';

const router = Router();
router.use(validateToken);
router.get('/', getAllDentists);
router.get('/:id', getDentistById);
router.post('/', requireRole(1), createDentist);
router.put('/:id', requireRole(1), updateDentist);
router.delete('/:id', requireRole(1), deleteDentist);
export default router;
