import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Appointment, Service, User } from '../models';
import type { AppointmentStatus } from '../models/Appointment';
import { sendAppointmentConfirmationEmail } from '../middleware/email';

const includeAppointmentData = [
  { model: User, as: 'patient', attributes: ['UserId', 'FirstName', 'LastName', 'Email', 'Phone', 'Gender', 'BirthDate'] },
  { model: User, as: 'dentist', attributes: ['UserId', 'FirstName', 'LastName', 'Email'] },
  { model: Service, as: 'service', attributes: ['ServiceId', 'Description'] }
];

const appointmentJson = (appointment: Appointment) => ({
  appointmentId: appointment.AppointmentId,
  appointmentDate: appointment.AppointmentDate,
  patientUserId: appointment.PatientUserId,
  dentistUserId: appointment.DentistUserId,
  serviceId: appointment.ServiceId,
  notes: appointment.Notes,
  status: appointment.Status,
  patient: appointment.patient ? {
    userId: appointment.patient.UserId, firstName: appointment.patient.FirstName, lastName: appointment.patient.LastName,
    email: appointment.patient.Email, phone: appointment.patient.Phone, gender: appointment.patient.Gender, birthDate: appointment.patient.BirthDate
  } : null,
  dentist: appointment.dentist ? {
    userId: appointment.dentist.UserId, firstName: appointment.dentist.FirstName, lastName: appointment.dentist.LastName, email: appointment.dentist.Email
  } : null,
  service: appointment.service ? { serviceId: appointment.service.ServiceId, description: appointment.service.Description } : null
});

const canAccess = (appointment: Appointment, userId: number): boolean =>
  appointment.PatientUserId === userId || appointment.DentistUserId === userId;

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const { appointmentDate, patientUserId, dentistUserId, serviceId, notes } = req.body as Record<string, unknown>;
  const patientId = Number(patientUserId);
  const dentistId = Number(dentistUserId);
  const service = await Service.findByPk(Number(serviceId));
  if (!service) { res.status(404).json({ success: false, message: 'Service not found.' }); return; }
  if (req.user.role === 2 && req.user.id !== patientId) {
    res.status(403).json({ success: false, message: 'Patients can only create appointments for themselves.' }); return;
  }

  const appointment = await Appointment.create({
    AppointmentDate: new Date(String(appointmentDate)), PatientUserId: patientId, DentistUserId: dentistId,
    ServiceId: service.ServiceId, Notes: typeof notes === 'string' ? notes.trim() || null : null, Status: 'P'
  });
  const created = await Appointment.findByPk(appointment.AppointmentId, { include: includeAppointmentData });
  if (!created) throw new Error('Created appointment could not be loaded.');
  res.status(201).json({ success: true, data: appointmentJson(created) });
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const requestedId = req.params.id ? Number(req.params.id) : req.user.id;
  if (requestedId !== req.user.id) { res.status(403).json({ success: false, message: 'You cannot access another user’s appointments.' }); return; }

  const where = req.user.role === 1 ? { DentistUserId: req.user.id } : { PatientUserId: req.user.id };
  const appointments = await Appointment.findAll({ where, include: includeAppointmentData, order: [['AppointmentDate', 'ASC']] });
  res.json({ success: true, data: appointments.map(appointmentJson) });
};

export const getAppointmentsByDateAndUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const userId = Number(req.params.userId);
  if (userId !== req.user.id) { res.status(403).json({ success: false, message: 'You cannot access another user’s appointments.' }); return; }
  const date = new Date(String(req.params.date));
  if (Number.isNaN(date.getTime())) { res.status(400).json({ success: false, message: 'Invalid date.' }); return; }
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setHours(23, 59, 59, 999);
  const appointments = await Appointment.findAll({
    where: { [Op.or]: [{ PatientUserId: userId }, { DentistUserId: userId }], AppointmentDate: { [Op.between]: [start, end] } },
    include: includeAppointmentData, order: [['AppointmentDate', 'ASC']]
  });
  res.json({ success: true, data: appointments.map(appointmentJson) });
};

export const getAppointment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const appointment = await Appointment.findByPk(Number(req.params.id), { include: includeAppointmentData });
  if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found.' }); return; }
  if (!canAccess(appointment, req.user.id)) { res.status(403).json({ success: false, message: 'Access denied.' }); return; }
  res.json({ success: true, data: appointmentJson(appointment) });
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const appointment = await Appointment.findByPk(Number(req.params.id), { include: includeAppointmentData });
  if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found.' }); return; }
  if (!canAccess(appointment, req.user.id)) { res.status(403).json({ success: false, message: 'Access denied.' }); return; }

  const { appointmentDate, status, serviceId, notes } = req.body as Record<string, unknown>;
  const allowedStatuses: AppointmentStatus[] = ['P', 'C', 'D', 'X'];
  if (status !== undefined && (typeof status !== 'string' || !allowedStatuses.includes(status as AppointmentStatus))) {
    res.status(400).json({ success: false, message: 'Invalid appointment status.' }); return;
  }
  if (req.user.role === 2 && status !== undefined && status !== 'X' && status !== appointment.Status) {
    res.status(403).json({ success: false, message: 'Patients may only cancel their own appointments.' }); return;
  }

  const nextDate = appointmentDate ? new Date(String(appointmentDate)) : appointment.AppointmentDate;
  const nextServiceId = serviceId ? Number(serviceId) : appointment.ServiceId;

  if (serviceId !== undefined) {
    const service = await Service.findByPk(nextServiceId);
    if (!service) { res.status(404).json({ success: false, message: 'Service not found.' }); return; }
  }

  if (appointmentDate !== undefined) {
    const oneHourBefore = new Date(nextDate.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(nextDate.getTime() + 60 * 60 * 1000);
    const conflict = await Appointment.findOne({
      where: {
        AppointmentId: { [Op.ne]: appointment.AppointmentId },
        AppointmentDate: { [Op.gt]: oneHourBefore, [Op.lt]: oneHourAfter },
        Status: { [Op.ne]: 'X' },
        [Op.or]: [
          { DentistUserId: appointment.DentistUserId },
          { PatientUserId: appointment.PatientUserId }
        ]
      }
    });
    if (conflict) {
      res.status(409).json({ success: false, message: 'Appointment conflict. Appointments must be at least one hour apart.' });
      return;
    }
  }

  const oldStatus = appointment.Status;
  await appointment.update({
    AppointmentDate: nextDate,
    Status: status ? status as AppointmentStatus : appointment.Status,
    ServiceId: nextServiceId,
    Notes: notes !== undefined ? (typeof notes === 'string' ? notes.trim() || null : null) : appointment.Notes
  });

  const updated = await Appointment.findByPk(appointment.AppointmentId, { include: includeAppointmentData });
  if (!updated) throw new Error('Updated appointment could not be loaded.');
  if (updated.Status === 'C' && oldStatus !== 'C' && updated.patient) {
    void sendAppointmentConfirmationEmail(updated, updated.patient).catch((error) => console.error('Confirmation email failed:', error));
  }
  res.json({ success: true, data: appointmentJson(updated) });
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required.' }); return; }
  const appointment = await Appointment.findByPk(Number(req.params.id));
  if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found.' }); return; }
  if (req.user.role !== 1 || appointment.DentistUserId !== req.user.id) {
    res.status(403).json({ success: false, message: 'Only the assigned dentist can permanently delete an appointment.' });
    return;
  }
  await appointment.destroy();
  res.json({ success: true, message: 'Appointment deleted successfully.' });
};
