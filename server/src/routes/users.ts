import { Router } from 'express';
import { createUser, getAllUsers, login, refreshToken, verifyToken } from '../controllers/userController';
import { requireRole, validateToken } from '../middleware/auth';
import { validateLogin, validateRegistration } from '../middleware/validators';

const router = Router();
router.post('/register', validateRegistration, createUser);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.get('/verify-token', validateToken, verifyToken);
router.get('/', validateToken, requireRole(1), getAllUsers);
export default router;
