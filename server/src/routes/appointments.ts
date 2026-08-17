import { Router } from 'express';
import { createAppointment, deleteAppointment, getAllAppointments, getAppointment, getAppointmentsByDateAndUser, updateAppointment } from '../controllers/appointmentController';
import { validateToken } from '../middleware/auth';
import { checkAppointmentConflict, validateAppointmentDate, validateAppointmentUsers } from '../middleware/validators';

const router = Router();
router.use(validateToken);
router.post('/', validateAppointmentDate, validateAppointmentUsers, checkAppointmentConflict, createAppointment);
router.get('/', getAllAppointments);
router.get('/date/:date/user/:userId', getAppointmentsByDateAndUser);
router.get('/user/:id', getAllAppointments);
router.get('/:id', getAppointment);
router.put('/:id', validateAppointmentDate, updateAppointment);
router.delete('/:id', deleteAppointment);
export default router;
