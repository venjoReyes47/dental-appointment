import type { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Appointment, User, UserRole } from '../models';

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter.' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter.' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain a number.' };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Password must contain a special character.' };
  return { valid: true };
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, password } = req.body as Record<string, unknown>;
  if (![firstName, lastName, email, password].every((value) => typeof value === 'string' && value.trim())) {
    res.status(400).json({ success: false, message: 'First name, last name, email and password are required.' });
    return;
  }
  if (!isValidEmail(email as string)) {
    res.status(400).json({ success: false, message: 'Invalid email format.' });
    return;
  }
  const result = validatePassword(password as string);
  if (!result.valid) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }
  next();
};

export const validateAppointmentDate = (req: Request, res: Response, next: NextFunction): void => {
  const rawDate = req.body?.appointmentDate as string | undefined;
  if (!rawDate) return next();
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    res.status(400).json({ success: false, message: 'Invalid appointment date.' });
    return;
  }
  if (date.getTime() <= Date.now()) {
    res.status(400).json({ success: false, message: 'Appointment date must be in the future.' });
    return;
  }
  next();
};

export const validateAppointmentUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const patientUserId = Number(req.body?.patientUserId);
  const dentistUserId = Number(req.body?.dentistUserId);
  if (!patientUserId || !dentistUserId) {
    res.status(400).json({ success: false, message: 'Patient and dentist are required.' });
    return;
  }

  const [patient, dentist] = await Promise.all([
    User.findOne({ where: { UserId: patientUserId, IsActive: 1 }, include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }] }),
    User.findOne({ where: { UserId: dentistUserId, IsActive: 1 }, include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }] })
  ]);

  if (!patient || patient.role?.RoleId !== 2 || !dentist || dentist.role?.RoleId !== 1) {
    res.status(400).json({ success: false, message: 'Invalid patient or dentist.' });
    return;
  }
  next();
};

export const checkAppointmentConflict = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const rawDate = req.body?.appointmentDate as string | undefined;
  const patientUserId = Number(req.body?.patientUserId);
  const dentistUserId = Number(req.body?.dentistUserId);
  if (!rawDate || !patientUserId || !dentistUserId) return next();

  const appointmentDate = new Date(rawDate);
  const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
  const oneHourAfter = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
  const appointmentId = req.params.id ? Number(req.params.id) : undefined;

  const existing = await Appointment.findOne({
    where: {
      AppointmentDate: { [Op.gt]: oneHourBefore, [Op.lt]: oneHourAfter },
      Status: { [Op.ne]: 'X' },
      [Op.or]: [{ DentistUserId: dentistUserId }, { PatientUserId: patientUserId }],
      ...(appointmentId ? { AppointmentId: { [Op.ne]: appointmentId } } : {})
    }
  });

  if (existing) {
    res.status(409).json({ success: false, message: 'Appointment conflict. Appointments must be at least one hour apart.' });
    return;
  }
  next();
};
