import { Router } from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from '../controllers/roleController';
import { requireRole, validateToken } from '../middleware/auth';

const router = Router();
router.use(validateToken, requireRole(1));
router.post('/', createRole);
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
export default router;
